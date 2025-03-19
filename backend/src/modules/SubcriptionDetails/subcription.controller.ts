
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
      expireDateTime: Date;
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
      'expireDateTime'
    ];

    const missingFields = requiredFields.filter((field) => !body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        statusCode: 400,
        message: `Missing required fields: ${missingFields.join(', ')}`,
        success: false,
      });
    }

    // Data from frontend
    const updatedBody = { ...body, userId, email };

    // Simulate Razorpay data fetching
    const razorpayData = {
      transactionId: 'RAZORPAY_TXN_12345', // Example Razorpay Transaction ID
      transactionDate: new Date(),
      activeDateTime: new Date(),         
      // Current timestamp as transaction date
      status: 'active'                    // Example status
    };

    // Combine frontend data + Razorpay data
    const finalData = { ...updatedBody, ...razorpayData };

    // Pass the final data to the service layer
    return this.subscriptionDetailsService.createSubscriptionDetails(finalData, req, res);
  }
}