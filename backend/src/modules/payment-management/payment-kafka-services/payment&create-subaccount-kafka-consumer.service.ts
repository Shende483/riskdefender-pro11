
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Kafka, Consumer, Producer } from 'kafkajs';
import { Inject } from '@nestjs/common';
import { Types } from 'mongoose';
import { KafkaAdminService } from 'src/common/kafka/kafka-admin.service';
import { BrokerAccount, BrokerAccountDocument } from 'src/modules/sidebar-management/subaccount-management/sub-broker-account.schema';
import { SubbrokerPayment, SubbrokerPaymentDocument } from '../multiple-payment-schema/subbroker-payment.schema';
import { AlertPayment, AlertPaymentDocument } from '../multiple-payment-schema/alert-payment.schema';
import { TradingJournalPayment, TradingJournalPaymentDocument } from '../multiple-payment-schema/trading-journal-payment.schema';
import { PenaltyPayment, PenaltyPaymentDocument } from 'src/modules/payment-management/multiple-payment-schema/penalty-payment.schema';
import { AlertManagement, AlertManagementDocument } from 'src/modules/sidebar-management/alert-management/alert-management.schema';
import { TradingJournalManagement, TradingJournalManagementDocument } from 'src/modules/sidebar-management/trading-journal-management/trading-journal-management.schema';


@Injectable()
export class PaymentKafkaConsumerService implements OnModuleInit {
  private readonly logger = new Logger(PaymentKafkaConsumerService.name);
  private consumer: Consumer;
  private producer: Producer;
  private readonly topics = ['payment_initiation', 'payment_verification', 'broker_account'];
  private lastPaymentId: string | null = null;
  private lastPaymentType: string | null = null;

  constructor(
    @InjectModel(SubbrokerPayment.name) private readonly subbrokerPaymentModel: Model<SubbrokerPaymentDocument>,
    @InjectModel(TradingJournalPayment.name) private readonly tradingJournalPaymentModel: Model<TradingJournalPaymentDocument>,
    @InjectModel(AlertPayment.name) private readonly alertPaymentModel: Model<AlertPaymentDocument>,
    @InjectModel(PenaltyPayment.name) private readonly penaltyPaymentModel: Model<PenaltyPaymentDocument>,
    @InjectModel(BrokerAccount.name) private readonly brokerAccountModel: Model<BrokerAccountDocument>,
    @InjectModel(AlertManagement.name) private readonly alertManagementModel: Model<AlertManagementDocument>,
        @InjectModel(TradingJournalManagement.name) private readonly TradingJournalManagementModel: Model<TradingJournalManagementDocument>,
    @Inject('KAFKA_CLIENT') private readonly kafka: Kafka,
    @Inject(KafkaAdminService) private readonly kafkaAdminService: KafkaAdminService,
  ) {
    this.consumer = this.kafka.consumer({
      groupId: 'payment-consumer-group',
      allowAutoTopicCreation: true,
      sessionTimeout: 30000,
      rebalanceTimeout: 60000,
      heartbeatInterval: 3000,
    });
    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    try {
      await this.producer.connect();
      await this.waitForTopics(15, 10000);
      await this.consumer.connect();
      await this.consumer.subscribe({
        topics: this.topics,
        fromBeginning: true,
      });
    //  this.logger.log('Kafka consumer initialized for payment topics', this.topics);

      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          let data: any = null;
          try {
            data = message.value ? JSON.parse(message.value.toString()) : null;
            this.logger.log(`Received message from ${topic} [partition ${partition}, offset ${message.offset}]:`, data);
           console.log('Received message from topic:', topic, 'with data:', data);

            if (topic === 'payment_initiation' || topic === 'payment_verification') {
              if (!data.planId || !data.userId || !data.paymentType) {
                throw new Error('Missing required fields: planId, userId, or paymentType');
              }

              const basePaymentData = {
                userId: new Types.ObjectId(data.userId),
                planId: new Types.ObjectId(data.planId),
                couponCode: data.couponCode || '',
                amount: data.amount,
                currency: data.currency,
                razorpayPaymentId: data.razorpayPaymentId || '',
                orderId: data.orderId,
                paymentStatus: data.paymentStatus,
                paymentType: data.paymentType,
                planStatus: data.planStatus ,
              };


            const penaltyPaymentData = {
            userId: new Types.ObjectId(data.userId),
             brokerAccountId: new Types.ObjectId(data.brokerAccountId),
             penaltyPlanId: new Types.ObjectId(data.planId),
             paymentType: data.paymentType,
             couponCode: data.couponCode || '',
             amount: data.amount,
              currency: data.currency,
             razorpayPaymentId: data.razorpayPaymentId || '',
             orderId: data.orderId,
              paymentStatus: data.paymentStatus,
              paymentDate: new Date(),
            };
 

            const alertPaymentData = {
              userId: new Types.ObjectId(data.userId),
              alertPlanId: new Types.ObjectId(data.planId),
              alertLimit: data.alertLimit || 0,
              paymentType: data.paymentType,
              couponCode: data.couponCode || '',
              amount: data.amount,
              currency: data.currency,
              razorpayPaymentId: data.razorpayPaymentId || '',
              orderId: data.orderId,
              paymentStatus: data.paymentStatus,
              paymentDate: new Date(),

            }

           const tradingJournalPaymentData = {
              userId: new Types.ObjectId(data.userId),
              tradingJournalPlanId: new Types.ObjectId(data.planId),
              tradingJournalLimit: data.tradingJournalLimit || 0,
              paymentType: data.paymentType,
              couponCode: data.couponCode || '',
              amount: data.amount,
              currency: data.currency,
              razorpayPaymentId: data.razorpayPaymentId || '',
              orderId: data.orderId,
              paymentStatus: data.paymentStatus,
              paymentDate: new Date(),

            }



              let payment;
              switch (data.paymentType) {
                case 'createBroker':
                case 'renewBroker':
                  const subbrokerPaymentData = {
                    ...basePaymentData,
                    startDate: new Date(data.startDate),
                    endDate: new Date(data.endDate),
                  };
                  if (topic === 'payment_initiation') {
                    payment = new this.subbrokerPaymentModel(subbrokerPaymentData);
                    await payment.save();

                    console.log("subbrokerPaymentData  bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb  jfffffffdata we recieved ", payment)
                  } else {
                    payment = await this.subbrokerPaymentModel.findOneAndUpdate(
                      { orderId: data.orderId, userId: new Types.ObjectId(data.userId) },
                      subbrokerPaymentData,
                      { new: true },
                    );
                    if (!payment) {
                      payment = new this.subbrokerPaymentModel(subbrokerPaymentData);
                      await payment.save();
                    }
                  }
                  break;
                case 'tradingJournalRenew':
                  if (topic === 'payment_initiation') {
                    payment = new this.tradingJournalPaymentModel(tradingJournalPaymentData);
                    await payment.save();
                  } else {
                    payment = await this.tradingJournalPaymentModel.findOneAndUpdate(
                      { orderId: data.orderId, userId: new Types.ObjectId(data.userId) },
                      tradingJournalPaymentData,
                      { new: true },
                    );
                    if (!payment) {
                      payment = new this.tradingJournalPaymentModel(tradingJournalPaymentData);
                      await payment.save();
                    }
                  }
                  // Update TradingJournalManagement myTradingJournalLimit
                  if (payment.paymentStatus === 'success') {
                    const tradingJournalManagement = await this.TradingJournalManagementModel.findOne({ userId: new Types.ObjectId(data.userId) });
                    if (tradingJournalManagement) {
                      tradingJournalManagement.myTradingJournalLimit += tradingJournalPaymentData.tradingJournalLimit;
                      await tradingJournalManagement.save();
                    } else {
                      const newTradingJournalManagement = new this.TradingJournalManagementModel({
                        userId: new Types.ObjectId(data.userId),
                        myTradingJournalLimit: tradingJournalPaymentData.tradingJournalLimit,
                      });
                      await newTradingJournalManagement.save();
                    }
                  }
                  break;

                case 'alertRenew':
                  if (topic === 'payment_initiation') {
                    payment = new this.alertPaymentModel(alertPaymentData);
                    await payment.save();
                  } else {
                    console.log("Alert uyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyypdate data", alertPaymentData);
                    payment = await this.alertPaymentModel.findOneAndUpdate(
                      { orderId: data.orderId, userId: new Types.ObjectId(data.userId) },
                      alertPaymentData,
                      { new: true },
                    );
                    if (!payment) {
                      payment = new this.alertPaymentModel(alertPaymentData);
                      await payment.save();
                    }
                  }
                  // Update AlertManagement myAlertLimit
                  if (payment.paymentStatus === 'success') {
                    const alertManagement = await this.alertManagementModel.findOne({ userId: new Types.ObjectId(data.userId) });
                    if (alertManagement) {
                      alertManagement.myAlertLimit += alertPaymentData.alertLimit;
                      await alertManagement.save();
                    } else {
                      const newAlertManagement = new this.alertManagementModel({
                        userId: new Types.ObjectId(data.userId),
                        myAlertLimit: alertPaymentData.alertLimit,
                      });
                      await newAlertManagement.save();
                    }
                  }
                  break;

  case 'penaltyPayment':
 // console.log("penalty data received", penaltyPaymentData);
  if (topic === 'payment_initiation') {
    payment = new this.penaltyPaymentModel(penaltyPaymentData);
    await payment.save();
  } else {
    const updateData = { ...penaltyPaymentData };
    console.log("penalty uyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyypdate data", updateData);
    payment = await this.penaltyPaymentModel.findOneAndUpdate(
      { orderId: data.orderId, userId: new Types.ObjectId(data.userId) },
      { $set: updateData },
      { new: true }
    );
    if (!payment) {
      throw new Error('Payment not found for update');
           }
          }
         break;
         default:
         throw new Error(`Invalid paymentType: ${data.paymentType}`);
              }
              this.lastPaymentId = payment._id.toString();
              this.lastPaymentType = data.paymentType;
              this.logger.log(`✅ Payment saved to ${data.paymentType} collection:`, payment);
            }

        if (
              topic === 'broker_account' &&
              this.lastPaymentType !== null &&
              ['createBroker', 'renewBroker'].includes(this.lastPaymentType)
            ) {
              const paymentId = this.lastPaymentId;
              const paymentType = this.lastPaymentType;
              if (!paymentId || !Types.ObjectId.isValid(paymentId) || !paymentType) {
               // this.logger.error('❌ Invalid or missing paymentId or paymentType for BrokerAccount:', { paymentId, paymentType });
                await this.producer.send({
                  topic: 'broker_account_dlq',
                  messages: [{ value: JSON.stringify({ originalMessage: data, error: 'Missing paymentId or paymentType' }) }],
                });
                return;
              }

              let payment;
              let retries = 30; // Increased retries for robustness
              while (retries > 0) {
                payment = await this.subbrokerPaymentModel.findById(paymentId);
                if (payment) break;
              //  this.logger.warn(`❌ Payment not found for BrokerAccount: ${paymentId}, retrying (${retries} left)`);
                await new Promise((resolve) => setTimeout(resolve, 2000));
                retries--;
              }

              if (!payment) {
                this.logger.error('❌ Payment not found for BrokerAccount after retries:', paymentId);
                await this.producer.send({
                  topic: 'broker_account_dlq',
                  messages: [{ value: JSON.stringify({ originalMessage: data, error: 'Payment not found' }) }],
                });
                return;
              }

              if (paymentType === 'createBroker') {
                const updateData: any = {
                  userId: data.userId ? new Types.ObjectId(data.userId) : undefined,
                  marketTypeId: data.marketTypeId || '',
                  brokerId: data.brokerId ? new Types.ObjectId(data.brokerId) : undefined,
                  subAccountName: data.subAccountName || '',
                  mainApiKey: 'sample-api-key',
                  mainSecretKey: 'sample-secret-key',
                  subApiKey: 'placeholder-api-key',
                  subSecretKey: 'placeholder-secret-key',
                  status: 'inactive',
                  tradingRuleData: { cash: [], option: [], future: [] },
                  noRulesChange: false,
                  createdAt: new Date(data.createdAt),
                  currentBrokerPaymentId: new Types.ObjectId(paymentId),
                  brokerPaymentHistoryIds: [new Types.ObjectId(paymentId)],
                };
                const newBrokerAccount = await this.brokerAccountModel.findOneAndUpdate(
                  { userId: data.userId ? new Types.ObjectId(data.userId) : null, subAccountName: data.subAccountName || '' },
                  { $set: updateData },
                  { upsert: true, new: true },
                );

                this.logger.log('✅ Broker Account Created in MongoDB:', newBrokerAccount);
              } else if (paymentType === 'renewBroker') {
                if (!data.brokerAccountId || !Types.ObjectId.isValid(data.brokerAccountId)) {
                 // this.logger.error('❌ Invalid or missing renewId for renewBroker:', { renewId: data.renewId });
                  await this.producer.send({
                    topic: 'broker_account_dlq',
                    messages: [{ value: JSON.stringify({ originalMessage: data, error: 'Invalid or missing renewId' }) }],
                  });
                  return;
                }

                const existingAccount = await this.brokerAccountModel.findById(data.brokerAccountId);
                if (!existingAccount) {
                  this.logger.error('❌ BrokerAccount not found for renewId:', data.brokerAccountId);
                  await this.producer.send({
                    topic: 'broker_account_dlq',
                    messages: [{ value: JSON.stringify({ originalMessage: data, error: 'BrokerAccount not found' }) }],
                  });
                  return;
                }

                const updatedAccount = await this.brokerAccountModel.findByIdAndUpdate(
                  data.brokerAccountId,
                  {
                    $set: {
                      currentBrokerPaymentId: new Types.ObjectId(paymentId),
                      status: 'active',
                    },
                    $push: {
                      brokerPaymentHistoryIds: new Types.ObjectId(paymentId),
                    },
                  },
                  { new: true },
                );

                if (!updatedAccount) {
                  this.logger.error('❌ Failed to update BrokerAccount for renewId:', data.brokerAccountId);
                  await this.producer.send({
                    topic: 'broker_account_dlq',
                    messages: [{ value: JSON.stringify({ originalMessage: data, error: 'Failed to update BrokerAccount' }) }],
                  });
                  return;
                }

                this.logger.log('✅ Broker Account Updated in MongoDB:', updatedAccount);
              }
            }







            if (topic === 'tradingjournal_payment' && this.lastPaymentType === 'tradingJournalRenew') {
              const paymentId = this.lastPaymentId;

              if (!paymentId || !Types.ObjectId.isValid(paymentId)) {
              //  this.logger.error('❌ Invalid or missing paymentId for TradingJournalPayment:', { paymentId });
                await this.producer.send({
                  topic: 'tradingjournal_payment_dlq',
                  messages: [{ value: JSON.stringify({ originalMessage: data, error: 'Missing paymentId' }) }],
                });
                return;
              }

              let payment;
              let retries = 30; // Increased retries
              while (retries > 0) {
                payment = await this.tradingJournalPaymentModel.findById(paymentId);
                if (payment) break;
               // this.logger.warn(`❌ Payment not found for TradingJournalPayment: ${paymentId}, retrying (${retries} left)`);
                await new Promise((resolve) => setTimeout(resolve, 2000));
                retries--;
              }

              if (!payment) {
               // this.logger.error('❌ Payment not found for TradingJournalPayment after retries:', paymentId);
                await this.producer.send({
                  topic: 'tradingjournal_payment_dlq',
                  messages: [{ value: JSON.stringify({ originalMessage: data, error: 'Payment not found' }) }],
                });
                return;
              }

              this.logger.log('✅ Trading Journal Payment Processed:', payment);
            }




            if (topic === 'alert_payment' && this.lastPaymentType === 'alertRenew') {
              const paymentId = this.lastPaymentId;

              if (!paymentId || !Types.ObjectId.isValid(paymentId)) {
              //  this.logger.error('❌ Invalid or missing paymentId for AlertPayment:', { paymentId });
                await this.producer.send({
                  topic: 'alert_payment_dlq',
                  messages: [{ value: JSON.stringify({ originalMessage: data, error: 'Missing paymentId' }) }],
                });
                return;
              }

              let payment;
              let retries = 30; // Increased retries
              while (retries > 0) {
                payment = await this.alertPaymentModel.findById(paymentId);
                if (payment) break;
               // this.logger.warn(`❌ Payment not found for AlertPayment: ${paymentId}, retrying (${retries} left)`);
                await new Promise((resolve) => setTimeout(resolve, 2000));
                retries--;
              }

              if (!payment) {
            //    this.logger.error('❌ Payment not found for AlertPayment after retries:', paymentId);
                await this.producer.send({
                  topic: 'alert_payment_dlq',
                  messages: [{ value: JSON.stringify({ originalMessage: data, error: 'Payment not found' }) }],
                });
                return;
              }

              this.logger.log('✅ Alert Payment Processed:', payment);
            }

     
          } catch (error) {
           //// this.logger.error(`Failed to process message from ${topic} [offset ${message.offset}]:`, error);
            await this.producer.send({
              topic: `${topic}_dlq`,
              messages: [{ value: JSON.stringify({ originalMessage: data, error: error.message }) }],
            });
          }
        },
      });
    } catch (error) {
     // this.logger.error('Kafka consumer initialization failed:', error);
      throw error;
    }
  }

  async waitForTopics(maxRetries: number, delayMs: number): Promise<void> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const existingTopics = await this.kafkaAdminService.listTopics();
        const missingTopics = this.topics.filter((topic) => !existingTopics.includes(topic));
        if (missingTopics.length === 0) {
          //this.logger.log('All required topics exist:', this.topics.join(', '));
          return;
        }
       // this.logger.warn(`Missing topics: ${missingTopics.join(', ')}. Attempt ${attempt}/${maxRetries}`);
      } catch (error) {
      //  this.logger.error(`Failed to check topics on attempt ${attempt}: ${error.message}`, error.stack);
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
   // throw new Error(`Required topics not available after ${maxRetries} attempts: ${this.topics.join(', ')}`);
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
    await this.producer.disconnect();
  }
}

