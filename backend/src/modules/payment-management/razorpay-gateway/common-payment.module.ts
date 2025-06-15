import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PaymentDetailsController } from './payment.controller';
import { PaymentService } from './payment.service';
import { SubbrokerPayment, SubbrokerPaymentSchema } from '../multiple-payment-schema/subbroker-payment.schema';
import jwtConfing from 'src/config/jwt.confing';
import { Coupon, CouponSchema } from 'src/modules/plans&coupon-management/common-coupon-plan/coupon-schema';
import { SubbrokerPlan, SubbrokerPlanDetailsSchema } from 'src/modules/plans&coupon-management/subbroker-plan/subbroker-plan.schema';
import { KafkaModule } from 'src/common/kafka/kafka.module';
import { BrokerAccount, BrokerAccountSchema } from 'src/modules/sidebar-management/subaccount-management/sub-broker-account.schema';
import { RazorpayService } from 'src/config/razorpay.config';
import { TradingJournalPayment, TradingJournalPaymentSchema } from '../multiple-payment-schema/trading-journal-payment.schema';
import { AlertPayment, AlertPaymentSchema } from '../multiple-payment-schema/alert-payment.schema';
import { AlertPlan, AlertPlanDetailsSchema } from 'src/modules/plans&coupon-management/alert-plan/alert-plan.schema';
import { TradingJournalPlan, TradingJournalPlanDetailsSchema } from 'src/modules/plans&coupon-management/trading-journal-plan/trading-journal-plan.schema';
import { PenaltyPlan, PenaltyPlanDetailsSchema } from 'src/modules/plans&coupon-management/penalty-plan/penalty-plan.schema';
import { PenaltyPayment, PenaltyPaymentSchema } from 'src/modules/payment-management/multiple-payment-schema/penalty-payment.schema';
import { AlertManagement, AlertManagementSchema } from 'src/modules/sidebar-management/alert-management/alert-management.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SubbrokerPayment.name, schema: SubbrokerPaymentSchema },
      { name: TradingJournalPayment.name, schema: TradingJournalPaymentSchema },
      { name: AlertPayment.name, schema: AlertPaymentSchema },
      { name: SubbrokerPlan.name, schema: SubbrokerPlanDetailsSchema },
      { name: AlertPlan.name, schema: AlertPlanDetailsSchema },
      { name: TradingJournalPlan.name, schema: TradingJournalPlanDetailsSchema },
      { name: Coupon.name, schema: CouponSchema },
      { name: BrokerAccount.name, schema: BrokerAccountSchema },
      { name: PenaltyPlan.name, schema: PenaltyPlanDetailsSchema },
      { name: PenaltyPayment.name, schema: PenaltyPaymentSchema },  
      { name: AlertManagement.name, schema: AlertManagementSchema },                            
    ]),
     KafkaModule,
    JwtModule.registerAsync(jwtConfing.asProvider()),
  ],
  controllers: [PaymentDetailsController],
  providers: [PaymentService,RazorpayService],
})

export class PaymentModule {}