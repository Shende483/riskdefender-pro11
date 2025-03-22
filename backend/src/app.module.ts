import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisService } from './config/redis.config';
import { LoginModule } from './modules/auth/loginAuth/login.module';
import { RegisterModule } from './modules/auth/registerAuth/register.module';
import { DatabaseConfig } from './config/database.config';
import { TradingRulesModule } from './modules/TradingRules/tradingRules.module';
import { SubscriptionDetailsModule } from './modules/subcriptionDetails/subcription.module';
import { ForgetPasswordModule } from './modules/auth/forgetPasswordAuth/forgetPassword.Module';
<<<<<<< HEAD
import { recordPaymnetModule } from './modules/recordPayment/payment.module';
import { UpdateUserInfoModule } from './modules/auth/updateUserInfo/UserUpdateInfo.module';

=======
import { PlanModule } from './modules/adminModules/planManage/plan.module';

import { BrokersModule } from './modules/adminModules/BrokerManagment/broker.module';
import { MarketTypeModule } from './modules/adminModules/MarketType/marketType.module';
>>>>>>> 8131c1b0d24c7974ac1e5a1b1d6b876d58f8dce9

@Module({
  imports: [
    ConfigModule.forRoot(), // Load .env
    DatabaseConfig,
    LoginModule,
    RegisterModule,
    ForgetPasswordModule,
    TradingRulesModule,
    SubscriptionDetailsModule,
<<<<<<< HEAD
    recordPaymnetModule,
    UpdateUserInfoModule
   
=======
    PlanModule,
    MarketTypeModule,
    BrokersModule,

>>>>>>> 8131c1b0d24c7974ac1e5a1b1d6b876d58f8dce9
  ],
  providers: [RedisService],
  exports: [RedisService ],
})
export class AppModule {}
