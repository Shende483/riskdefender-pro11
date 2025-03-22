// src/module/users/users.module.ts
import { Module } from '@nestjs/common';
import { RegisterService } from '../updateUserInfo/UserUpdateInfo.service';
import { RegisterController } from './UserUpdateInfo.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './UserUpdateInfo.schema';
import { RedisModule } from 'src/common/redis.module';
import { OtpService } from '../../../common/otp.service';
import jwtConfing from 'src/config/jwt.confing';
import { JwtModule } from '@nestjs/jwt';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    RedisModule,
    JwtModule.registerAsync( jwtConfing.asProvider() ),
    // Ensure RedisModule is imported for OTP verification
  ],
     
  controllers: [RegisterController],
  providers: [RegisterService, OtpService], // Include OtpService
  exports: [RegisterService, OtpService], // Export OtpService as well
})
export class UpdateUserInfoModule {}
