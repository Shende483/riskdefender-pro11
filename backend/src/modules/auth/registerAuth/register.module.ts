// src/module/users/users.module.ts
import { Module } from '@nestjs/common';
import { RegisterService } from './register.service';
import { RegisterController } from './register.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './register.schema';
import { RedisModule } from 'src/common/redis.module';
import { OtpService } from '../../../common/otp.service';
import { TradingJournalManagement, TradingJournalManagementSchema } from 'src/modules/sidebar-management/trading-journal-management/trading-journal-management.schema';
import { AlertManagement, AlertManagementSchema } from 'src/modules/sidebar-management/alert-management/alert-management.schema';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: TradingJournalManagement.name, schema: TradingJournalManagementSchema },
      { name: AlertManagement.name, schema:AlertManagementSchema},
    
    
    ]),
    RedisModule, // Ensure RedisModule is imported for OTP verification
  ],
  controllers: [RegisterController],
  providers: [RegisterService, OtpService], // Include OtpService
  exports: [RegisterService, OtpService], // Export OtpService as well
})
export class RegisterModule {}
