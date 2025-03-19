

/*

import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SubscriptionDetails, SubscriptionDetailsDocument } from './subcription.schema';

@Injectable()
export class SubscriptionDetailsService {
  constructor(
    @InjectModel(SubscriptionDetails.name)
    private readonly subscriptionDetailsModel: Model<SubscriptionDetailsDocument>,
  ) {}

  async createSubscriptionDetails(details: {
    planName: string;
    numberOfBroker: number;
    activeDateTime: Date;
    expireDateTime: Date;
    transactionId: string;
    transactionDate: Date;
    status: string;
    userId: object;    // Added `userId` to receive it directly from the controller
    email: string;     // Added `email` to receive it directly from the controller
  }, req: any, res: any) {
    
    const { userId, email } = details; // Extract `userId` and `email` from details

    // Log user details for confirmation
    console.log(`🟠 Received UserId: ${userId}, 🔵 Email: ${email}`);

    const existingSubscription = await this.subscriptionDetailsModel.findOne({
      userId,
      planName: details.planName,
    });

    if (existingSubscription) {
      return res.status(400).json({
        statusCode: 400,
        message: `PlanName-${existingSubscription.planName} already exists for this user.Please try with different "Plan Name"`,
        success: false,
      });
    }

    const newSubscriptionDetails = new this.subscriptionDetailsModel({
      ...details,
      userId,
    });

    await newSubscriptionDetails.save();

    return res.status(200).json({
      statusCode: 200,
      message: 'Subscription created successfully.',
      success: true,
    });
  }
}
*/

import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SubscriptionDetails, SubscriptionDetailsDocument } from './subcription.schema';

@Injectable()
export class SubscriptionDetailsService {
  constructor(
    @InjectModel(SubscriptionDetails.name)
    private readonly subscriptionDetailsModel: Model<SubscriptionDetailsDocument>,
  ) {}

  async createSubscriptionDetails(
    details: {
      planName: string;
      numberOfBroker: number;
      activeDateTime: Date;
      expireDateTime: Date;
      transactionId: string;
      transactionDate: Date;
      status: string;
      userId: object; // Added `userId` to receive it directly from the controller
      email: string; // Added `email` to receive it directly from the controller
    },
    req: any,
    res: any,
  ) {
    const { userId, email } = details; // Extract `userId` and `email` from details

    // Log user details for confirmation
    console.log(`🟠 Received UserId: ${userId}, 🔵 Email: ${email}`);

    // Check if a subscription with the same plan name already exists for the user
    const existingSubscription = await this.subscriptionDetailsModel.findOne({
      userId,
      planName: details.planName,
    });

    if (existingSubscription) {
      return res.status(400).json({
        statusCode: 400,
        message: `PlanName-${existingSubscription.planName} already exists for this user. Please try with a different "Plan Name".`,
        success: false,
      });
    }

    // Create a new subscription document
    const newSubscriptionDetails = new this.subscriptionDetailsModel({
      ...details,
      userId,
    });

    // Save the new subscription to the database
    await newSubscriptionDetails.save();

    // Return a success response
    return res.status(201).json({
      statusCode: 201,
      message: 'Subscription created successfully.',
      success: true,
      data: newSubscriptionDetails, // Optionally include the created document in the response
    });
  }
}