



import { Module } from '@nestjs/common';
import { ScheduleModule, SchedulerRegistry } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import { UpdateTradingRuleService } from './update-subaccount-trading-rule.service';
import { UpdateTradingRuleController } from './update-subaccount-trading-rule.controller';
import { BrokerAccount, BrokerAccountSchema } from 'src/modules/sidebar-management/subaccount-management/sub-broker-account.schema';
import { PendingUpdate, PendingUpdateSchema } from './update-subaccount-trading-rule.schema';
import { JwtModule } from '@nestjs/jwt';
import jwtConfing from 'src/config/jwt.confing';
import { KafkaModule } from 'src/common/kafka/kafka.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([
      { name: PendingUpdate.name, schema: PendingUpdateSchema },
      { name: BrokerAccount.name, schema: BrokerAccountSchema },
    ]),
      JwtModule.registerAsync(jwtConfing.asProvider()),
        KafkaModule,
  ],
  controllers: [UpdateTradingRuleController],
  providers: [UpdateTradingRuleService,
            SchedulerRegistry],
})
export class UpdateSubaccountTradingRuleJobModule {}