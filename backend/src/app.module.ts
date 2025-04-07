import { ConfigModule } from '@nestjs/config';
import { DatabaseConfig } from './config/database.config';
import { LoginModule } from './modules/auth/loginAuth/login.module';
import { RegisterModule } from './modules/auth/registerAuth/register.module';
import { ForgetPasswordModule } from './modules/auth/forgetPasswordAuth/forgetPassword.Module';
import { SubscriptionDetailsModule } from './modules/SubcriptionDetails/subcription.module';
import { recordPaymnetModule } from './modules/recordPayment/payment.module';
import { UpdateUserInfoModule } from './modules/auth/updateUserInfoAuth/UserUpdateInfo.module';
import { AdminPlanModule } from './modules/adminModules/planManage/plan.module';
import { AdminMarketTypeModule } from './modules/adminModules/MarketType/marketType.module';
import { AdminBrokersModule } from './modules/adminModules/BrokerManagment/broker.module';
import { TradingRulesModule } from './modules/adminModules/TradingRulesManagment/tradingRules.modules';
import { BrokerAccountModule } from './modules/BrokerAccountManagement/brokerAccount.module';
import { RedisService } from './config/redis.config';
import { Module } from '@nestjs/common';
import { UserAccountDetailModule } from './modules/adminModules/UserAccountDetail/userAccountDetail.module';

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
    UserAccountDetailModule,
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class AppModule {}
