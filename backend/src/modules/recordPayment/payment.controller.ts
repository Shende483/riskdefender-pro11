import { v4 as uuidv4 } from 'uuid';
import { Controller, Post, Body, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('payment-details')
export class PaymentDetailsController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('payment')
  @UseGuards(JwtAuthGuard)
  async createPayment(
    @Body()
    body: {
      userId: string;
      subscriptionId: string;
      amount: number;
      paymentMethod: string;
      // transactionId: string;
      status: string;
    },
    @Req() req: Request,
    @Res() res: Response,
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
      'subscriptionId',
      'amount',
      'paymentMethod',
      'transactionId',
      'status',
    ];

    const missingFields = requiredFields.filter((field) => !body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        statusCode: 400,
        message: `Please complete all required fields before proceeding.`,
        success: false,
      });
    }

    const transactionId = uuidv4();
    const finalData = { ...body, userId, email, transactionId };

    return this.paymentService.createPayment(finalData, req, res);
  }
}
