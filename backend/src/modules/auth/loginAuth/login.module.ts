


import { Module } from '@nestjs/common';
import { LoginService } from './login.service';
import { LoginController } from './login.controller';
import { RegisterModule } from '../registerAuth/register.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../../../common/strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OtpService } from '../../../common/otp.service';
import { RedisModule } from 'src/common/redis.module';
import jwtConfing from 'src/config/jwt.confing';

@Module({
  imports: [
    RegisterModule,
    RedisModule, // ✅ Add RedisModule
    JwtModule.registerAsync( jwtConfing.asProvider() ),
      

  ],
  controllers: [LoginController],
  providers: [LoginService, JwtStrategy, OtpService],
})
export class LoginModule {}





