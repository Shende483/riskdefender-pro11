import { Module } from '@nestjs/common';
import { ForgetPasswordService } from './forgetPassword.service';
import { RegisterModule } from '../registerAuth/register.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../../../common/strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OtpService } from '../../../common/otp.service';
import { RedisModule } from 'src/common/redis.module';
import { ForgetPasswordController } from './forgotPassword.controller';

@Module({
  imports: [
    RegisterModule,
    RedisModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [ForgetPasswordController],
  providers: [ForgetPasswordService, JwtStrategy, OtpService],
})
export class ForgetPasswordModule {} // Make sure this is properly imported in your AppModule