import { Body, Controller, Get, Post, Res, Req, UseGuards } from '@nestjs/common';
import { Response, Request } from 'express';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { PenaltyService } from './penalty-management.service';



@Controller('Penalty')
export class PenaltyController {
  constructor(private readonly penaltyService: PenaltyService) {}

  @Get('penalty-details')
  @UseGuards(JwtAuthGuard)
  async getPenaltypPlan(
    @Req() req: Request,
    @Res() res: Response
  ) {
    const { userId } = req['user'];
    console.log('Fetching Penalty for user:', userId);
    if (!userId) {
      return {
        statusCode: 401,
        message: 'User not signed in',
        success: false,
      };
    }
    const penaltyDetails = await this.penaltyService.getPenaltyPlan(userId);
    return res.status(200).json({
      statusCode: penaltyDetails.statusCode,
      message: penaltyDetails.message,
      success: penaltyDetails.success,
      data: penaltyDetails.data,
    });
  }
}







