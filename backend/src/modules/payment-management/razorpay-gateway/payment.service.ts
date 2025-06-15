import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Document, Model } from 'mongoose';

import Razorpay = require('razorpay');
import * as crypto from 'crypto';
import { Response } from 'express';
import { addMonths } from 'date-fns';
import { Kafka } from 'kafkajs';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Coupon, CouponDocument } from 'src/modules/plans&coupon-management/common-coupon-plan/coupon-schema';
import { SubbrokerPlan, SubbrokerPlanDocument } from 'src/modules/plans&coupon-management/subbroker-plan/subbroker-plan.schema';
import { AlertPlan, AlertPlanDocument } from 'src/modules/plans&coupon-management/alert-plan/alert-plan.schema';
import { TradingJournalPlan, TradingJournalPlanDocument } from 'src/modules/plans&coupon-management/trading-journal-plan/trading-journal-plan.schema';
import { PenaltyPlan, PenaltyPlanDocument } from 'src/modules/plans&coupon-management/penalty-plan/penalty-plan.schema';

import { PenaltyPayment, PenaltyPaymentDocument } from 'src/modules/payment-management/multiple-payment-schema/penalty-payment.schema';
import { SubbrokerPayment, SubbrokerPaymentDocument } from '../multiple-payment-schema/subbroker-payment.schema';
import { AlertPayment, AlertPaymentDocument } from '../multiple-payment-schema/alert-payment.schema';
import { TradingJournalPayment, TradingJournalPaymentDocument } from 'src/modules/payment-management/multiple-payment-schema/trading-journal-payment.schema';

@Injectable()
export class PaymentService {
  private razorpay: Razorpay;
  private kafka: Kafka;
  private producer: import('kafkajs').Producer;

  constructor(
    @InjectModel(SubbrokerPayment.name)
    private readonly paymentModel: Model<SubbrokerPaymentDocument>,
    @InjectModel(TradingJournalPayment.name)
    private readonly tradingJournalPaymentModel: Model<TradingJournalPaymentDocument>,
    @InjectModel(AlertPayment.name)
    private readonly alertPaymentModel: Model<AlertPaymentDocument>,
    @InjectModel(PenaltyPayment.name)
    private readonly penaltyPaymentModel: Model<PenaltyPaymentDocument>,
    @InjectModel(SubbrokerPlan.name)
    private readonly subbrokerPlanModel: Model<SubbrokerPlanDocument>,
    @InjectModel(AlertPlan.name)
    private readonly alertPlanModel: Model<AlertPlanDocument>,
    @InjectModel(TradingJournalPlan.name)
    private readonly tradingJournalPlanModel: Model<TradingJournalPlanDocument>,
    @InjectModel(PenaltyPlan.name)
    private readonly penaltyPlanModel: Model<PenaltyPlanDocument>,
    @InjectModel(Coupon.name)
    private readonly couponModel: Model<CouponDocument>,
    @Inject('KAFKA_CLIENT') kafka: Kafka,
    @Inject('RAZORPAY_CLIENT') razorpay: Razorpay,
    private readonly configService: ConfigService,
  ) {
    this.razorpay = razorpay;
    this.kafka = kafka;
    this.producer = this.kafka.producer();
    this.producer.connect().catch((error) => {
      console.error('❌ Failed to connect Kafka producer:', error.message);
    });
  }

  private async calculateNetPayment(
    planId: string,
    couponCode: string | undefined,
    currency: string,
    paymentType: string,
  ): Promise<{ amount: number; durationInMonths?: number; tradingJournalLimit?: number; alertLimit?: number }> {
    let plan: any = null;
    let durationInMonths: number | undefined;
    let tradingJournalLimit: number = 0;
    let alertLimit: number = 0;

    switch (paymentType) {
      case 'createBroker':
      case 'renewBroker':
        plan = await this.subbrokerPlanModel.findById(planId);
        durationInMonths = (plan as SubbrokerPlan)?.durationInMonths;
        break;
      case 'tradingJournalRenew':
        plan = await this.tradingJournalPlanModel.findById(planId);
        tradingJournalLimit = (plan as TradingJournalPlan)?.tradingJournalLimit;
        break;
      case 'alertRenew':
        plan = await this.alertPlanModel.findById(planId);
        alertLimit = (plan as AlertPlan)?.alertLimit;
        break;
      case 'penaltyPayment':
        plan = await this.penaltyPlanModel.findById(planId);
        break;
      default:
        throw new BadRequestException('Invalid payment type for plan lookup');
    }

    if (!plan || plan.status !== 'active') {
      throw new BadRequestException('Invalid or inactive plan');
    }

    let totalAmount = Number(plan.price[currency]);
    if (paymentType === 'createBroker' || paymentType === 'renewBroker') {
      totalAmount = totalAmount * Number(durationInMonths);
    }
    totalAmount = Number(totalAmount.toFixed(2));

    const planDiscount = plan.discountPercent || 0;
    const discountAmount = totalAmount * (planDiscount / 100);
    totalAmount = totalAmount - Number(discountAmount.toFixed(2));

    const gstRate = plan.gstRate || 18;
    const gstAmount = totalAmount * (gstRate / 100);
    totalAmount = totalAmount + Number(gstAmount.toFixed(2));

    if (couponCode) {
      const coupon = await this.couponModel.findOne({ code: couponCode, status: 'active' });
      if (!coupon) {
        throw new BadRequestException('Invalid or inactive coupon');
      }
      const couponDiscountAmount = totalAmount * (coupon.discountPercentage / 100);
      totalAmount = totalAmount - Number(couponDiscountAmount.toFixed(2));
    }

    totalAmount = Math.round(totalAmount * 100);

    const result: { amount: number; durationInMonths?: number; tradingJournalLimit?: number; alertLimit?: number } = {
      amount: totalAmount,
    };

    if (paymentType === 'createBroker' || paymentType === 'renewBroker') {
      result.durationInMonths = durationInMonths;
    } else if (paymentType === 'tradingJournalRenew') {
      result.tradingJournalLimit = tradingJournalLimit;
    } else if (paymentType === 'alertRenew') {
      result.alertLimit = alertLimit;
    }

    return result;
  }

  private calculateEndDate(startDate: Date, durationInMonths: number): Date {
    return addMonths(startDate, durationInMonths);
  }

  async initiatePayment(
    details: {
      userId: string;
      planId: string;
      couponCode?: string;
      amount: number;
      currency: string;
      email: string;
      mobile: string;
      paymentType: string;
     
    },
    res: Response,
  ) {
    try {
      if (!details.planId || !details.amount || !details.currency || !details.paymentType) {
        return res.status(200).json({
          statusCode: 400,
          message: 'Missing required fields: planId, amount, currency, paymentType',
          success: false,
        });
      }

      const validPaymentTypes = ['createBroker', 'renewBroker', 'tradingJournalRenew', 'alertRenew', 'penaltyPayment'];
      if (!validPaymentTypes.includes(details.paymentType)) {
        return res.status(200).json({
          statusCode: 400,
          message: 'Invalid or unsupported paymentType',
          success: false,
        });
      }

      const planDetails = await this.calculateNetPayment(details.planId, details.couponCode, details.currency, details.paymentType);
      const frontendAmount = Math.round(details.amount);
console.log("amount verify","frontend:",frontendAmount,"backend",planDetails.amount)

      if (planDetails.amount !== frontendAmount) {
        return res.status(200).json({
          statusCode: 400,
          message: 'Amount tampering detected',
          success: false,
        });
      }

      const keyId = this.configService.get<string>('RAZORPAY_KEY_ID');
      if (!keyId) {
        throw new Error('RAZORPAY_KEY_ID not found');
      }

      const options = {
        amount: planDetails.amount,
        currency: details.currency,
        payment_capture: 1,
    //    notes: {
       //   userId: details.userId,
        //  planId: details.planId,
        //  couponCode: details.couponCode || '',
        //  paymentType: details.paymentType,
        //  key: keyId,
       // },
      };

      const order = await this.razorpay.orders.create(options);

      const paymentRecord: any = {
        userId: details.userId,
        planId: details.planId,
        couponCode: details.couponCode || '',
        amount: planDetails.amount,
        currency: details.currency,
        razorpayPaymentId: '',
        orderId: order.id,
        paymentStatus: 'pending',
        planStatus: 'inactive',
        paymentType: details.paymentType,
      };

      if (details.paymentType === 'createBroker' || details.paymentType === 'renewBroker') {
        const startDate = new Date();
        paymentRecord.startDate = startDate.toISOString();
        if (typeof planDetails.durationInMonths === 'number') {
          paymentRecord.endDate = this.calculateEndDate(startDate, planDetails.durationInMonths).toISOString();
        } else {
          throw new BadRequestException('Plan duration is missing or invalid');
        }
      } else if (details.paymentType === 'tradingJournalRenew') {
        paymentRecord.tradingJournalLimit = planDetails.tradingJournalLimit ;
      } else if (details.paymentType === 'alertRenew') {
        paymentRecord.alertLimit = planDetails.alertLimit || 0;
      } 
      
      //else if (details.paymentType === 'penaltyPayment') {
      //  paymentRecord.penaltyPlanId = details.planId;
       // const penaltyPlan = await this.penaltyPlanModel.findById(details.planId);
       // paymentRecord.penaltyName = penaltyPlan?.name || 'Unknown Penalty';
     // }


console.log( "payment initain for payment",paymentRecord)


      await this.producer.send({
        topic: 'payment_initiation',
        messages: [{ value: JSON.stringify(paymentRecord) }],
      });

      const responseData = {
        statusCode: 200,
        message: 'Payment initiation successful',
        success: true,
        data: {
          orderId: order.id,
          amount: order.amount,
          currency: details.currency,
          email: details.email,
          mobile: details.mobile,
          createdAt: order.created_at,
          status: 'created',
          keyId,
        },
      };

      return res.status(200).json(responseData);
    } catch (error: any) {
      console.error('❌ Error creating Razorpay order:', error);
      let statusCode = 500;
      let errorMessage = 'Error creating payment order';
      if (error.error && error.error.description) {
        errorMessage = error.error.description;
        statusCode = 400;
      } else if (error.message) {
        errorMessage = error.message;
      }
      await this.producer.send({
        topic: 'payment_initiation_dlq',
        messages: [{ value: JSON.stringify({ originalMessage: details, error: errorMessage }) }],
      });
      return res.status(200).json({
        statusCode,
        message: errorMessage,
        success: false,
        error: {
          name: error.name || 'PaymentError',
          details: error.error || '',
        },
      });
    }
  }

  async verifyPayment(
    details: {
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
      userId: string;
      planId: string;
      marketTypeId?: string;
      brokerId?: string;
      subAccountName?: string;
      couponCode?: string;
      amount: number;
      currency: string;
      paymentType: string;
      brokerAccountId?: string;
     // journalId?: string;
     // alertId?: string;
    },
    res: Response,
  ) {
    try {

      console.log('Payment verification details:', details);
      const planDetails = await this.calculateNetPayment(details.planId, details.couponCode, details.currency, details.paymentType);
      console.log(planDetails.amount, 'Plan Amount:', details.amount);
      if (planDetails.amount !== Math.round(details.amount)) {
        throw new BadRequestException('Amount tampering detected');
      }

      const validPaymentTypes = ['createBroker', 'renewBroker', 'tradingJournalRenew', 'alertRenew', 'penaltyPayment'];
      if (!validPaymentTypes.includes(details.paymentType)) {
        throw new BadRequestException('Invalid or unsupported paymentType');
      }

      const secret = this.configService.get<string>('RAZORPAY_KEY_SECRET');
      if (!secret) {
        throw new Error('RAZORPAY_KEY_SECRET is not defined');
      }

      const generatedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${details.razorpayOrderId}|${details.razorpayPaymentId}`)
        .digest('hex');

      if (generatedSignature !== details.razorpaySignature) {
        throw new BadRequestException('Invalid payment signature');
      }

      const razorpayStatus = await this.razorpay.orders.fetchPayments(details.razorpayOrderId);
      if (razorpayStatus.items.length > 0 && razorpayStatus.items[0].status === 'captured') {
        const paymentRecord: any = {
          userId: details.userId,
         brokerAccountId: details.brokerAccountId,
          planId: details.planId,
          couponCode: details.couponCode || '',
          amount: planDetails.amount,
          currency: details.currency,
          razorpayPaymentId: details.razorpayPaymentId,
          orderId: details.razorpayOrderId,
          paymentStatus: 'success',
          planStatus: 'active',
          paymentType: details.paymentType,
        };

        if (details.paymentType === 'createBroker' || details.paymentType === 'renewBroker') {
          const startDate = new Date();
          paymentRecord.startDate = startDate.toISOString();
          if (typeof planDetails.durationInMonths === 'number') {
            paymentRecord.endDate = this.calculateEndDate(startDate, planDetails.durationInMonths).toISOString();
          } else {
            throw new BadRequestException('Plan duration is missing or invalid');
          }
        } else if (details.paymentType === 'tradingJournalRenew') {
          paymentRecord.tradingJournalLimit = planDetails.tradingJournalLimit || 0;
        } else if (details.paymentType === 'alertRenew') {
          paymentRecord.alertLimit = planDetails.alertLimit || 0;
        } else if (details.paymentType === 'penaltyPayment') {
         
        }
        await this.producer.send({
          topic: 'payment_verification',
          messages: [{ value: JSON.stringify(paymentRecord) }],
        });



//end verification for payment and save data for payment verifcation









        if (details.paymentType === 'createBroker') {
          const brokerAccountRecord = {
            userId: details.userId,
            planId: details.planId,
            marketTypeId: details.marketTypeId || '',
            brokerId: details.brokerId || '',
            subAccountName: details.subAccountName || '',
            paymentType: details.paymentType,
            createdAt: new Date().toISOString(),
          };
          await this.producer.send({
            topic: 'broker_account',
            messages: [{ value: JSON.stringify(brokerAccountRecord) }],
          });
        } else if (details.paymentType === 'renewBroker') {
          const brokerAccountRecord = {
            userId: details.userId,
            planId: details.planId,
            brokerAccountId: details.brokerAccountId,
            paymentType: details.paymentType,
            createdAt: new Date().toISOString(),
          };
          await this.producer.send({
            topic: 'broker_account',
            messages: [{ value: JSON.stringify(brokerAccountRecord) }],
          });
        } else if (details.paymentType === 'tradingJournalRenew') {
          const tradingJournalRecord = {
            userId: details.userId,
            planId: details.planId,
           // journalId: details.journalId || '',
            paymentType: details.paymentType,
            createdAt: new Date().toISOString(),
          };
          await this.producer.send({
            topic: 'tradingjournal_payment',
            messages: [{ value: JSON.stringify(tradingJournalRecord) }],
          });
        } else if (details.paymentType === 'alertRenew') {
          const alertRecord = {
            userId: details.userId,
            planId: details.planId,
           // alertId: details.alertId || '',
            paymentType: details.paymentType,
            createdAt: new Date().toISOString(),
          };
          await this.producer.send({
            topic: 'alert_payment',
            messages: [{ value: JSON.stringify(alertRecord) }],
          });

        } 
     
        return res.status(200).json({
          statusCode: 200,
          message: 'Payment recorded successfully',
          success: true,
        });
      } else {
        throw new BadRequestException('Payment not captured');
      }
    } catch (error: any) {
      console.error('❌ Error verifying payment:', error);
      await this.producer.send({
        topic: 'payment_verification_dlq',
        messages: [{ value: JSON.stringify({ originalMessage: details, error: error.message }) }],
      });
      return res.status(200).json({
        statusCode: 400,
        message: 'Payment verification failed',
        success: false,
        error: error.message,
      });
    }
  }
}










