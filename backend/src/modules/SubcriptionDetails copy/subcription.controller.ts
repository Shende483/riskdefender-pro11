import { Controller, Post, Body, Res, Req, UseGuards } from '@nestjs/common';
import { Response, Request } from 'express';
import { SubscriptionDetailsService } from './subcription.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('subscription-details')
export class SubscriptionDetailsController {
  constructor(private readonly subscriptionDetailsService: SubscriptionDetailsService) {}

  @Post('create')
  //@UseGuards(JwtAuthGuard)
  async createSubscriptionDetails(
    @Body() body: {
      subAccountName: string;
      totalAllotmentAccount: number;
      startDate: Date;
      endDate: Date;
      status: string;
    },
    @Req() req: Request,
    @Res() res: Response
  ) {
    return this.subscriptionDetailsService.createSubscriptionDetails(body, req, res);
  }
}
