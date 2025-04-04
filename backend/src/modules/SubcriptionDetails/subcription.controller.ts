

import { Controller, Post,Get, Body, Res, Req, UseGuards, Put, Param } from '@nestjs/common';
import { Response, Request } from 'express';
import { ApiBody } from '@nestjs/swagger';
import { SubscriptionService } from '../SubcriptionDetails/subcription.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('subscription-details')
export class SubscriptionDetailsController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

 @ApiBody({
    schema: {
      type: 'object',
      properties: {
        planId: { type: 'string'}, 
        planName: {type: 'string'},
        numberOfBroker: {type: 'number'},
        endDate: {type: 'Date'}
      },
    },
  })
  @Post('subscribe')
  @UseGuards(JwtAuthGuard)
  async createSubscription(
    @Body() body: {
      planId: string;
      planName: string;
      numberOfBroker: number;
      endDate: Date;
    },
    @Req() req: Request,
    @Res() res: Response
  ) {
    console.log('Received Body:', body);
    console.log('User from Token:', req['user']);

    const { userId, email } = req['user'];

    if (!userId) {
      return res.status(400).json({
        statusCode: 400,
        message: 'UserId is required',
        success: false,
      });
    }

    const requiredFields = [
      'planName',
      'numberOfBroker',
      'endDate'
    ];

    const missingFields = requiredFields.filter((field) => !body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        statusCode: 400,
        message: `Please complete all required fields before proceeding.`,
        success: false,
      });
    }

    // Data from frontend
    const updatedBody = { ...body, userId, email };

    // Simulate Razorpay data fetching
    const razorpayData = {
      startDate: new Date(),
      status: 'active'                    // Example status
    };

    // Combine frontend data + Razorpay data
    const finalData = { ...updatedBody, ...razorpayData };

    // Pass the final data to the service layer
    return this.subscriptionService.createSubscription(finalData, res);
  }

//get User Subcriptions Details
  @Get('get-user-subscriptions')
  @UseGuards(JwtAuthGuard)
  async getUserSubscriptions(
    @Req() req: Request,
    @Res() res: Response
  ) {
    const { userId } = req['user'];

    if (!userId) {
      return res.status(400).json({
        statusCode: 400,
        message: 'UserId is required',
        success: false,
      });
    }

    return this.subscriptionService.getUserSubscriptions(userId, res);
  }

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        subscriptionId: { type: 'string'}, 
        status: {type: 'string'}
      },
    },
  })
  @Post('update')
  @UseGuards(JwtAuthGuard)
  async updateSubscription(
    @Body() body: {
     subscriptionId: string,
     status:string,
    },
    @Req() req: Request,
    @Res() res: any
  ) {

    const { userId,} = req['user'];
   // console.log("updatestatus",subscriptionId)
    const details = {...body ,userId}
    return this.subscriptionService.updateSubscription(details,res,req);
  }
}









