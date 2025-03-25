import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { TradingRulesService } from './tradingRules.service';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { TradingRulesDto } from './dto/tradingRules.dto';

@Controller('trading-rules')
export class TradingRulesController {
  constructor(private readonly tradingRulesService: TradingRulesService) {}

  @Post('createRules')
  @UseGuards(JwtAuthGuard)
  async createRules(
    @Body() createTradingRulesDto: TradingRulesDto,
    @Res() res: Response,
  ) {
    return this.tradingRulesService.createTradingRules(
      createTradingRulesDto,
      res,
    );
  }

  @Get('getRules')
  @UseGuards(JwtAuthGuard)
  async getTradingRules(@Res() res: Response) {
    try {
      const rules = await this.tradingRulesService.getRules();
      res.status(200).json({
        statusCode: 200,
        message: 'Trading rules retrieved successfully.',
        data: rules,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        statusCode: 500,
        message: 'Error retrieving trading rules.',
      });
    }
  }
}
