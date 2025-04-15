import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { TradingRulesService } from './tradingRules.service';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreateTradingRulesDto } from './dto/tradingRules.dto';
import { CreateRuleDto } from './dto/rules.dto';
import { TradingRulesDocument } from './tradingRules.schema';

@Controller('trading-rules')
export class TradingRulesController {
  constructor(private readonly tradingRulesService: TradingRulesService) {}

  @Post('createRules')
  @UseGuards(JwtAuthGuard)
  async createRules(
    @Body() createTradingRulesDto: CreateTradingRulesDto,
    @Res() res: Response,
  ) {
    return this.tradingRulesService.createTradingRules(
      createTradingRulesDto,
      res,
    );
  }

  @Get('getRules')
  @UseGuards(JwtAuthGuard)
  async getRules(@Res() res: Response) {
    return this.tradingRulesService.getTradingRules(res);
  }




  @Get('rulesByMarketTypeId')
  @UseGuards(JwtAuthGuard)
  async getRulesByMarketTypeId(
    @Query('marketTypeId') marketTypeId: string,
  ): Promise<TradingRulesDocument[]> {
    console.log('🔹 Received marketTypeId:', marketTypeId);
    return this.tradingRulesService.getRulesByMarketTypeId(marketTypeId);
  }
  


  // @Delete(':id/deleteRules')
  // async deleteRules(@Param('id') id: string, @Res() res: Response) {
  //   return this.tradingRulesService.deleteTradingRules(id, res);
  // }
}
