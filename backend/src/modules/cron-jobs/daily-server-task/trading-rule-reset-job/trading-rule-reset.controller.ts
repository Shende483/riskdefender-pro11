import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { TradingRuleResetService } from './trading-rule-reset.service';
import { TradingRuleResetDto } from './trading-rule-reset.dto/trading-rule-reset.dto';


@Controller('trading-rule-resets')
export class TradingRuleResetController {
  constructor(private tradingRuleResetService: TradingRuleResetService) {}

  @Post()
  create(@Body() task: TradingRuleResetDto) {
   // return this.tradingRuleResetService.addCronJob(task);
  }

  @Patch(':name')
  update(@Param('name') name: string, @Body() task: TradingRuleResetDto) {
  //  return this.tradingRuleResetService.updateCronJob(name, task);
  }

  @Delete(':name')
  delete(@Param('name') name: string) {
    //return this.tradingRuleResetService.deleteCronJob(name);
  }

  @Get()
  list() {
   // return this.tradingRuleResetService.getCronJobs();
  }
}