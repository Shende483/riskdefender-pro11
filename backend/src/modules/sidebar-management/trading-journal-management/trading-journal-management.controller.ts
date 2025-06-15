import { Body, Controller, Get, Post, Res, Req, UseGuards } from '@nestjs/common';
import { Response, Request } from 'express';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { TradingJournalService } from './trading-journal-management.service';


@Controller('tradingJournal')
export class TradingJournalController {
  constructor(private readonly tradingJournalService: TradingJournalService) {}

  @Get('journal-limits')
  @UseGuards(JwtAuthGuard)
  async getTradingJournalLimits(
    @Req() req: Request,
    @Res() res: Response
  ) {
    const { userId } = req['user'];
    console.log('Fetching trading journal limits for user:', userId);
    if (!userId) {
      return {
        statusCode: 401,
        message: 'User not signed in',
        success: false,
      };
    }
    const journalDetails = await this.tradingJournalService.getTradingJournalLimits(userId);
     return res.status(200).json({
      statusCode: journalDetails.statusCode,
      message: journalDetails.message,
      success: journalDetails.success,
      data: journalDetails.data,
    });
  }
}