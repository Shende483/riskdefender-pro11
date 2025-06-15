


 import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { DeleteUserSubaccountController } from './delete-user-subaccount.controller';
import { DeleteUserSubaccountService } from './delete-user-subaccount.service';
import { KafkaModule } from 'src/common/kafka/kafka.module';
import jwtConfing from 'src/config/jwt.confing';
import { BrokerAccount, BrokerAccountSchema } from 'src/modules/sidebar-management/subaccount-management/sub-broker-account.schema';
import { PendingDeletion, PendingDeletionSchema } from './delete-user-subaccount.schema';
import { SchedulerRegistry } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([
      { name: BrokerAccount.name, schema: BrokerAccountSchema },
      { name: PendingDeletion.name, schema: PendingDeletionSchema },
    ]),
    JwtModule.registerAsync(jwtConfing.asProvider()),
    KafkaModule,
  ],
  controllers: [DeleteUserSubaccountController],
  providers: [
    DeleteUserSubaccountService,
    SchedulerRegistry, // Explicitly provide SchedulerRegistry
  ],
})
export class DeleteUserSubaccountJobModule {}