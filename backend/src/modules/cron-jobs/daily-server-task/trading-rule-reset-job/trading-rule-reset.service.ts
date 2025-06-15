import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { TradingRuleResetDto } from './trading-rule-reset.dto/trading-rule-reset.dto';


@Injectable()
export class TradingRuleResetService {
  constructor(private schedulerRegistry: SchedulerRegistry) {}



 
}