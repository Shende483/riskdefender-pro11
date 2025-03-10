
import { Module } from '@nestjs/common';
import { ForgetPasswordService } from './forgetPassword.service';
import { ForgetPasswordController } from './forgotPassword.controller';
import { RegisterModule } from '../registerAuth/register.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../../../common/strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OtpService } from '../../../common/otp.service';
import { RedisModule } from 'src/common/redis.module';

@Module({
  imports: [
    RegisterModule,
    RedisModule, // ✅ Add RedisModule
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
export class LoginModule {}
