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
    subAccountName: string;
    totalAllotmentAccount: number;
    startDate: Date;
    endDate: Date;
    status: string;
  }, req: any, res: any) {
    const userId = req.user?.userId; // Extract userId from token

    const existingSubaccount = await this.subscriptionDetailsModel.findOne({
      userId,
      subAccountName: details.subAccountName,
    });

    if (existingSubaccount) {
      res.status(400).json({
        statusCode: 400,
        message: 'Subaccount name already exists for this user.',
        success: false,
      });
      return;
    }

    const newSubscriptionDetails = new this.subscriptionDetailsModel({
      ...details,
      userId,
    });

    await newSubscriptionDetails.save();

    res.status(200).json({
      statusCode: 200,
      message: 'Subscription created successfully.',
      success: true,
    });
  }
}
