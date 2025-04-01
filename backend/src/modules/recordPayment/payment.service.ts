

import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentDocument } from './payment.schema';

import Razorpay = require("razorpay")
import * as crypto from 'crypto';
import { Response } from 'express';

@Injectable()
export class PaymentService {
  private razorpay: Razorpay;

  constructor(
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
  ) {
    this.razorpay = new Razorpay({
      key_id: 'rzp_test_eOk7fWZMLa686r', // Replace with your Razorpay Key ID
      key_secret: 'mA4npg5V8wDTDNxROfyalPMP', // Replace with your Razorpay Secret Key
    });
  }

  async initiatePayment(
    details: {
      userId: string;
      subscriptionId: string;
      amount: number;
      currency: string;
      paymentMethod: string;
      email: string;
      mobile:string;
    },
    res: Response,
  ) {


  //  console.log('✅ uuid transction id Created:', details.transactionId);

    try {
      const options = {
        amount: details.amount*100, // Amount should already be in paise
        currency: details.currency,
      //  receipt: details.transactionId,
        payment_capture: 1,
      };

      const order = await this.razorpay.orders.create(options);
      console.log('✅ Razorpay Order Created:', order);



      const razorpayStatus = await this.razorpay.orders.fetchPayments(order.id)


      return res.status(200).json({
        statusCode: 200,
        message: 'Payment initiation successful',
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        subscriptionId: details.subscriptionId,
        email:details.email,
        mobile:details.mobile // ✅ Taken from details
      });
    } catch (error) {
      console.error('❌ Error creating Razorpay order:', error);
      return res.status(500).json({
        statusCode: 500,
        message: 'Error creating payment order',
        success: false,
        error: error.message,
      });
    }
  }


  
  async verifyPayment(
    details: {
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
      userId: string; // ✅ Taken from details
      subscriptionId: string; // ✅ Taken from details
      amount: string;
    },
    res: Response,
  ) {
    try {
      const secret = 'mA4npg5V8wDTDNxROfyalPMP'; // Store this securely in `.env`
      const generatedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${details.razorpayOrderId}|${details.razorpayPaymentId}`)
        .digest('hex');

      console.log('Frontend Generated Key:', details, generatedSignature);

      if (generatedSignature !== details.razorpaySignature) {
        throw new BadRequestException('Invalid payment signature');
      }

     const razorpayStatus = await this.razorpay.orders.fetchPayments(details.razorpayOrderId);
    console.log("raz",razorpayStatus)
     if (razorpayStatus.items.length > 0 && razorpayStatus.items[0].status === 'captured') {
      const newPayment = new this.paymentModel({
        userId: details.userId, // ✅ Taken from details
        subscriptionId: details.subscriptionId, // ✅ Taken from details
        amount:razorpayStatus.items[0].amount,
        transactionId: razorpayStatus.items[0].order_id,
        status: 'success',
        paymentMethod: razorpayStatus.items[0].method
      });
      const savedPayment = await newPayment.save();
      console.log('✅ Payment Verified and Saved:', savedPayment);

      return res.status(200).json({
        statusCode: 200,
        message: 'Payment Recorded successfully',
        success: true,
        paymentId: savedPayment._id.toString(),
      });
    }


    } catch (error) {
      console.error('❌ Error verifying payment:', error);
      return res.status(400).json({
        statusCode: 400,
        message: 'Payment verification failed',
        success: false,
        error: error.message,
      });
    }
  }

}
