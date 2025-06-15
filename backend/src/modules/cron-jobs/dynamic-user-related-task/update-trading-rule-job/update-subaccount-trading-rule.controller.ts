import { Controller, Post, Body, UseGuards, Req, Res } from '@nestjs/common';
import { UpdateTradingRuleService } from './update-subaccount-trading-rule.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Request, Response } from 'express';
import { UpdateTradingRuleDto } from './update-subaccount-trading-rule.dto/update-subaccount-trading-rule.dto';

@Controller('trading-rules')
export class UpdateTradingRuleController {
  constructor(private updateUserTradingRuleService: UpdateTradingRuleService) {}

  @Post('update')
  @UseGuards(JwtAuthGuard)
  async requestUpdate(
    @Body() body: UpdateTradingRuleDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    console.log('Received request for updating trading rule:', body);
    const { userId } = req['user'];
    const { brokerAccountId } = body;
    if (!userId) {
      return res.status(401).json({
        statusCode: 401,
        message: 'User not signed in',
        success: false,
      });
    }
    await this.updateUserTradingRuleService.requestUpdate(userId, brokerAccountId, req, res);
  }

  @Post('cancel-update')
  @UseGuards(JwtAuthGuard)
  async cancelUpdate(
    @Body() body: UpdateTradingRuleDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    console.log('Received request for cancelling trading rule update:', body);
    const { userId } = req['user'];
    const { brokerAccountId } = body;
    if (!userId) {
      return res.status(401).json({
        statusCode: 401,
        message: 'User not signed in',
        success: false,
      });
    }
    await this.updateUserTradingRuleService.cancelUpdate(userId, brokerAccountId, req, res);
  }
}