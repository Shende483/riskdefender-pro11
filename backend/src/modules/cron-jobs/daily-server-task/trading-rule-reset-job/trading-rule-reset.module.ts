import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TradingRuleResetService } from './trading-rule-reset.service';
import { TradingRuleResetController } from './trading-rule-reset.controller';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [TradingRuleResetController],
  providers: [TradingRuleResetService],
})
export class TradingRuleResetJobModule {}