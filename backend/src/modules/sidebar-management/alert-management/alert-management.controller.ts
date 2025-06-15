import { Body, Controller, Get, Post, Res, Req, UseGuards } from '@nestjs/common';
import { Response, Request } from 'express';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { AlertService } from './alert-management.service';


@Controller('alert')
export class AlertController {
  constructor(private readonly alertService: AlertService) {}

  @Get('alert-limits')
  @UseGuards(JwtAuthGuard)
  async getAlertLimits(
    @Req() req: Request,
    @Res() res: Response
  ) {
    const { userId } = req['user'];
    console.log('Fetching alert limits for user:', userId);
    if (!userId) {
      return {
        statusCode: 401,
        message: 'User not signed in',
        success: false,
      };
    }
    const alertDetails = await this.alertService.getAlertLimits(userId);
    return res.status(200).json({
      statusCode: alertDetails.statusCode,
      message: alertDetails.message,
      success: alertDetails.success,
      data: alertDetails.data,
    });
  }
}







