import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisService } from './config/redis.config';
import { LoginModule } from './modules/auth/loginAuth/login.module';
import { RegisterModule } from './modules/auth/registerAuth/register.module';
import { DatabaseConfig } from './config/database.config';


@Module({
  imports: [
    ConfigModule.forRoot(), // Load .env
    DatabaseConfig,
    LoginModule,
    RegisterModule,
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class AppModule {}
