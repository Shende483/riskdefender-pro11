import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentDocument } from './payment.schema';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
  ) {}

  async createPayment(
    details: {
      userId: string;
      subscriptionId: string;
      amount: number;
      paymentMethod: string;
      transactionId: string;
      status: string;
    },
    req: any,
    res: any,
  ) {
    const { userId, subscriptionId } = details;

    // Log user and subscription details for confirmation
    console.log(`🟠 Received UserId: ${userId}, 🔵 SubscriptionId: ${subscriptionId}`);

    // Check if a payment with the same transaction ID already exists
    const existingPayment = await this.paymentModel.findOne({
      transactionId: details.transactionId,
    });

    if (existingPayment) {
      return res.status(400).json({
        statusCode: 400,
        message: `Transaction with ID "${existingPayment.transactionId}" already exists.`,
        success: false,
      });
    }

    // Create a new payment document
    const newPayment = new this.paymentModel({
      ...details,
      userId,
      subscriptionId,
    });

    // Save the new payment to the database
    const savedPayment = await newPayment.save();

    // Return a success response
    return res.status(201).json({
      statusCode: 201,
      message: "Payment recorded successfully.",
      success: true,
      paymentId: savedPayment._id.toString(),
    });
  }
}
