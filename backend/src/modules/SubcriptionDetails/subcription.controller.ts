
/*
import { Controller, Post, Body, Res, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { Response, Request } from 'express';
import { SubscriptionDetailsService } from './subcription.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('subscription-details')
export class SubscriptionDetailsController {
  constructor(private readonly subscriptionDetailsService: SubscriptionDetailsService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createSubscriptionDetails(
    @Body() body: {
      planName: string;
      numberOfBroker: number;
      activeDateTime: Date;
      expireDateTime: Date;
      transactionId: string;
      transactionDate: Date;
      status: string;
    },
    @Req() req: Request,
    @Res() res: Response
  ) {
    console.log('Received Body:', body);
    console.log('User from Token:', req['user']);

    const { userId, email } = req['user'];
    console.log(`UserId: ${userId}, Email: ${email}`);

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
      'activeDateTime',
      'expireDateTime',
      'transactionId',
      'transactionDate',
      'status'
    ];

    const missingFields = requiredFields.filter((field) => !body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        statusCode: 400,
        message: `Missing required fields: ${missingFields.join(', ')}`,
        success: false,
      });
    }

    const updatedBody = { ...body, userId, email };

    return this.subscriptionDetailsService.createSubscriptionDetails(updatedBody, req, res);
  }
}

*/


import { Controller, Post, Body, Res, Req, UseGuards } from '@nestjs/common';
import { Response, Request } from 'express';
import { ApiTags, ApiBody, ApiOperation } from '@nestjs/swagger';
import { SubscriptionService } from '../SubcriptionDetails/subcription.service';
import { CreateSubscriptionDetailsDto } from '../SubcriptionDetails/dto/subcription.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('subscription-details')
export class SubscriptionDetailsController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post('subscribe')
  @ApiBody({ type: CreateSubscriptionDetailsDto })
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
   // console.log(`UserId: ${userId}, Email: ${email}`);

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
    return this.subscriptionService.createSubscription(finalData, req, res);
  }
}