import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { RedisService } from './config/redis.config';
import { LoginModule } from './modules/auth/loginAuth/login.module';
import { RegisterModule } from './modules/auth/registerAuth/register.module';
import { DatabaseConfig } from './config/database.config';
import { TradingRulesModule } from './modules/TradingRules/tradingRules.module';
import { SubscriptionDetailsModule } from './modules/SubcriptionDetails/subcription.module';

@Module({
  imports: [
    ConfigModule.forRoot(), // Load .env
    DatabaseConfig,
    LoginModule,
    RegisterModule,
    TradingRulesModule,
    SubscriptionDetailsModule,
   
  ],
  providers: [RedisService],
  exports: [RedisService ],
})
export class AppModule {}
