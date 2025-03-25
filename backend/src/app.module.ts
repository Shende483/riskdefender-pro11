import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisService } from './config/redis.config';
import { LoginModule } from './modules/auth/loginAuth/login.module';
import { RegisterModule } from './modules/auth/registerAuth/register.module';
import { DatabaseConfig } from './config/database.config';
import { SubscriptionDetailsModule } from './modules/SubcriptionDetails/subcription.module';
import { ForgetPasswordModule } from './modules/auth/forgetPasswordAuth/forgetPassword.Module';
import { recordPaymnetModule } from './modules/recordPayment/payment.module';
import { UpdateUserInfoModule } from './modules/auth/updateUserInfoAuth/UserUpdateInfo.module';
import { AdminPlanModule } from './modules/adminModules/planManage/plan.module';
import { AdminBrokersModule } from './modules/adminModules/BrokerManagment/broker.module';
import { AdminMarketTypeModule } from './modules/adminModules/MarketType/marketType.module';
import { TradingRulesModule } from './modules/adminModules/TradingRulesManagment/tradingRules.modules';
import { BrokerAccountModule } from './modules/adminModules/BrokerAccountManagement/brokerAccount.module';

@Module({
  imports: [
    ConfigModule.forRoot(), // Load .env
    DatabaseConfig,
    LoginModule,
    RegisterModule,
    ForgetPasswordModule,
    SubscriptionDetailsModule,
    recordPaymnetModule,
    UpdateUserInfoModule,
    AdminPlanModule,
    AdminMarketTypeModule,
    AdminBrokersModule,
    TradingRulesModule,
    BrokerAccountModule,
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class AppModule {}
