import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BrokerAccount, BrokerAccountDocument } from '../sub-broker-account.schema';
import { User, UserDocument } from 'src/modules/auth/updateUserInfoAuth/UserUpdateInfo.schema';
import { Broker, BrokerDocument } from '../../../adminModules/BrokerManagment/broker.schema';
import { MarketType, MarketTypeSchema } from '../../../adminModules/MarketType/marketType.schema';

import { Kafka, Consumer } from 'kafkajs';
import { Inject } from '@nestjs/common';
import { KafkaAdminService } from 'src/common/kafka/kafka-admin.service';
import { PendingUpdate, PendingUpdateDocument } from 'src/modules/cron-jobs/dynamic-user-related-task/update-trading-rule-job/update-subaccount-trading-rule.schema';

@Injectable()
export class SubBrokerAccountKafkaConsumerService implements OnModuleInit {
  private readonly logger = new Logger(SubBrokerAccountKafkaConsumerService.name);
  private consumer: Consumer;
  private readonly topics = ['broker_account_rules_add', 'broker_account_rules_update'];

  constructor(
    @InjectModel(BrokerAccount.name)
    private readonly brokerAccountModel: Model<BrokerAccountDocument>,
    @InjectModel(Broker.name)
    private readonly brokerModel: Model<BrokerDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(MarketType.name)
    private readonly marketTypeModel: Model<MarketTypeSchema>,
    @InjectModel(PendingUpdate.name)
    private readonly pendingUpdateModel: Model<PendingUpdateDocument>, // Use Model<any> for schema
    @Inject('KAFKA_CLIENT') private readonly kafka: Kafka,
    @Inject(KafkaAdminService) private readonly kafkaAdminService: KafkaAdminService,
  ) {
    this.consumer = this.kafka.consumer({
      groupId: 'sub-broker-account-consumer-group',
      allowAutoTopicCreation: true,
      sessionTimeout: 30000,
      rebalanceTimeout: 60000,
      heartbeatInterval: 3000,
    });
  }

  async onModuleInit() {
    try {
      await this.waitForTopics(15, 10000);

      await this.consumer.connect();
      await this.consumer.subscribe({
        topics: this.topics,
        fromBeginning: true,
      });
      this.logger.log('Kafka consumer initialized for broker account rules topics');

      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            const data = message.value ? JSON.parse(message.value.toString()) : null;
            this.logger.log(`Received message from ${topic} [partition ${partition}]:`, data);

            if (topic === 'broker_account_rules_add') {
              const { _id, subApiKey, subSecretKey, mainApiKey, mainSecretKey, noRulesChange, tradingRuleData, updatedAt } = data;
              const updateData: any = {
                subApiKey,
                subSecretKey,
                mainApiKey,
                mainSecretKey,
                noRulesChange,
                tradingRuleData,
                status: "active",
                updatedAt: new Date(updatedAt),
              };

              const updatedBrokerAccount = await this.brokerAccountModel.findByIdAndUpdate(
                _id,
                { $set: updateData },
                { new: true, upsert: false }
              );

              this.logger.log('✅ Broker Account Created in MongoDB:', updatedBrokerAccount);
            } else if (topic === 'broker_account_rules_update') {
              const { _id, subApiKey, subSecretKey, mainApiKey, mainSecretKey, noRulesChange, tradingRuleData, updatedAt } = data;

              // Fetch existing broker account
              const existingAccount = await this.brokerAccountModel.findById(_id);
              if (!existingAccount) {
                this.logger.error(`Broker account with ID ${_id} not found`);
                return;
              }

              // Merge existing data with new data
              const updateData: any = {
                subApiKey: subApiKey || existingAccount.subApiKey,
                subSecretKey: subSecretKey || existingAccount.subSecretKey,
                mainApiKey: mainApiKey || existingAccount.mainApiKey,
                mainSecretKey: mainSecretKey || existingAccount.mainSecretKey,
                noRulesChange,
                tradingRuleData,
                updatedAt: new Date(updatedAt),
              };

              const updatedBrokerAccount = await this.brokerAccountModel.findByIdAndUpdate(
                _id,
                { $set: updateData },
                { new: true, upsert: false }
              );

              if (!updatedBrokerAccount) {
                this.logger.error(`Broker account with ID ${_id} not found`);
                return;
              }

              // Delete the corresponding PendingUpdate document
              await this.pendingUpdateModel.deleteOne({ brokerAccountId: _id }).exec();
              this.logger.log(`✅ Deleted PendingUpdate for broker account ${_id}`);

              this.logger.log('✅ Broker Account Updated in MongoDB:', updatedBrokerAccount);
            }
          } catch (error) {
            this.logger.error(`Failed to process message from ${topic}:`, error);
            throw error;
          }
        },
      });
    } catch (error) {
      this.logger.error('Kafka consumer initialization failed:', error);
      throw error;
    }
  }

  async waitForTopics(maxRetries: number, delayMs: number): Promise<void> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const existingTopics = await this.kafkaAdminService.listTopics();
        const missingTopics = this.topics.filter((topic) => !existingTopics.includes(topic));
        if (missingTopics.length === 0) {
          this.logger.log('All required topics exist:', this.topics.join(', '));
          return;
        }
        this.logger.warn(
          `Missing topics: ${missingTopics.join(', ')}. Attempt ${attempt}/${maxRetries}`,
        );
      } catch (error) {
        this.logger.error(`Failed to check topics on attempt ${attempt}: ${error.message}`, error.stack);
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
    throw new Error(`Required topics not available after ${maxRetries} attempts: ${this.topics.join(', ')}`);
  }
}