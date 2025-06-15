import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { DatabaseConfig } from './config/database.config';
import { KafkaModule } from './common/kafka/kafka.module';
import { LoginModule } from './modules/auth/loginAuth/login.module';
import { RegisterModule } from './modules/auth/registerAuth/register.module';
import { ForgetPasswordModule } from './modules/auth/forgetPasswordAuth/forgetPassword.Module';
import { PaymentModule } from './modules/payment-management/razorpay-gateway/common-payment.module';
import { UpdateUserInfoModule } from './modules/auth/updateUserInfoAuth/UserUpdateInfo.module';
import { AdminMarketTypeModule } from './modules/adminModules/MarketType/marketType.module';
import { AdminBrokersModule } from './modules/adminModules/BrokerManagment/broker.module';
import { UserExitAccountModule } from './modules/UserTradingExist/userTrading.module';
import { TradingRulesModule } from './modules/adminModules/TradingRulesManagment/tradingRules.modules';
import { AdminOrderPlacementModule } from './modules/orderPlacement/orderPlacement.module';
import { UserAccountDetailModule } from './modules/adminModules/UserAccountDetail/userAccountDetail.module';
import { OrderSubmitModule } from './modules/orderPlacing/orderSubmit/orderSubmit.module';
import { BrokersModule } from './modules/orderPlacing/BrokerIntegration/brokers.module';
import { RedisModule } from './common/redis.module';
import { BrokerAccountModule } from './modules/sidebar-management/trading-dashboard-management/trading-dashboard.module';
import { SubBrokerAccountModule } from './modules/sidebar-management/subaccount-management/sub-broker-account.module';
import { ProxyModule } from './modules/proxy-service-management/proxy-management.module';
import { SubbrokerPlanModule } from './modules/plans&coupon-management/subbroker-plan/subbroker-plan.module';
import { TradingJournalPlanModule } from './modules/plans&coupon-management/trading-journal-plan/trading-journal-plan.module';
import { AlertPlanModule } from './modules/plans&coupon-management/alert-plan/alert-plan.module';
import { UpdateSubaccountTradingRuleJobModule } from './modules/cron-jobs/dynamic-user-related-task/update-trading-rule-job/update-subaccount-trading-rule.module';
import { DeleteUserSubaccountJobModule } from './modules/cron-jobs/dynamic-user-related-task/delete-broker-job/delete-user-subaccount.module';
import { TradingRuleResetJobModule } from './modules/cron-jobs/daily-server-task/trading-rule-reset-job/trading-rule-reset.module';
import { TradingJournalModule } from './modules/sidebar-management/trading-journal-management/trading-journal-management.module';
import { AlertModule } from './modules/sidebar-management/alert-management/alert-management.module';
import { PenaltyPlanModule } from './modules/plans&coupon-management/penalty-plan/penalty-plan.module';
import { PenaltyModule } from './modules/sidebar-management/penalty-management/penalty-management.module';





@Module({
  imports: [

    ConfigModule.forRoot({
      envFilePath: '.env', // Explicitly specify .env
      isGlobal: true, // Make ConfigModule global
    }),

    DatabaseConfig,
    RedisModule, //
    KafkaModule,
    LoginModule,
    RegisterModule,
    ForgetPasswordModule,
    PaymentModule,
    UpdateUserInfoModule,
    AdminMarketTypeModule,
    AdminBrokersModule,
    TradingRulesModule,
    BrokerAccountModule,
    AdminOrderPlacementModule,
    UserAccountDetailModule,
    UserExitAccountModule,
    OrderSubmitModule,
    BrokersModule,
    SubBrokerAccountModule,
    ProxyModule,
    SubbrokerPlanModule,
    TradingJournalPlanModule,
    AlertPlanModule,
   PenaltyPlanModule,
    
//cron job
    TradingRuleResetJobModule,
    DeleteUserSubaccountJobModule,
    UpdateSubaccountTradingRuleJobModule,
    TradingJournalModule,
    AlertModule,
    PenaltyModule



  
  ]
})
export class AppModule {}


