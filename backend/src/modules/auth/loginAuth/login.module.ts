
/*


import { Module } from '@nestjs/common';
import { LoginService } from './login.service';
import { LoginController } from './login.controller';
import { RegisterModule } from '../registerAuth/register.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../../../common/strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    RegisterModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [LoginController],
  providers: [LoginService, JwtStrategy],
})
export class LoginModule {}
*/



import { Module } from '@nestjs/common';
import { LoginService } from './login.service';
import { LoginController } from './login.controller';
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
  controllers: [LoginController],
  providers: [LoginService, JwtStrategy, OtpService],
})
export class LoginModule {}
