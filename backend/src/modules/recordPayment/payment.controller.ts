



import { Controller, Post, Body, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { v4 as uuidv4 } from 'uuid';

@Controller('payment-details')
export class PaymentDetailsController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-payment')
  @UseGuards(JwtAuthGuard)
  async createPayment(
    @Body() body: {
      subscriptionId: string;
      amount: number;
      currency: string;
      paymentMethod: string;
    },
    @Req() req: Request,
    @Res() res: Response,
  ) {
    console.log('Received Body:', body);
    console.log('User from Token:', req['user']);

    const { userId, email , mobile } = req['user'];
    console.log(`UserId: ${userId}, mobile: ${mobile},`);

    if (!userId) {
      return res.status(400).json({
        statusCode: 400,
        message: 'UserId is required',
        success: false,
      });
    }

    // Generate a unique transaction ID
   // const transactionId = uuidv4();
    
    // Call service to initiate Razorpay payment
    return this.paymentService.initiatePayment(
      { ...body, userId, email, mobile},
      res,
    );
  }

  @Post('verify-payment')
  @UseGuards(JwtAuthGuard)
  async verifyPayment(
    @Body() body: {
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
      userId:string;
      subscriptionId: string; // ✅ Taken from details
      amount: string;
    },
    @Req() req: Request,
    @Res() res: Response,
  ) {  
    
    const { userId, email } = req['user'];
  console.log(`UserId: ${userId}, Email: ${email}`);
 
  const finalData = { ...body, userId, };
    console.log('Verifying Payment:', body);
    return this.paymentService.verifyPayment(finalData,res);
  }
}








