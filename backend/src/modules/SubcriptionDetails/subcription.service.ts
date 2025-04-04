



import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscription, SubscriptionDocument } from './subcription.schema';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectModel(Subscription.name)
    private readonly subscriptionModel: Model<SubscriptionDocument>,
  ) {}

  async createSubscription(
    details: {
      planId: string;
      planName: string;
      numberOfBroker: number;
      startDate: Date;
      endDate: Date;
      status: string;
      userId: object;
     // email: string;
    },
    res: any,
  
  ) {
    const { userId, endDate } = details;
    console.log(`🟠 Received endDate: ${endDate},`);

    const existingSubscription = await this.subscriptionModel.findOne({
      userId,
      planName: details.planName,
    });

    if (existingSubscription) {
      return res.status(400).json({
        statusCode: 400,
        message: `Plan ${existingSubscription.planName} already exists for this user. Try a different name.`,
        success: false,
      });
    }

    const newSubscription = new this.subscriptionModel({
      ...details,
      userId,
    });

    try {
      const savedSubscription = await newSubscription.save();
      return res.status(201).json({
        statusCode: 201,
        message: 'Plan subscribed successfully.',
        success: true,
        subscriptionId: savedSubscription._id.toString(),
        endDate: savedSubscription.endDate,
      });
    } catch (error) {
      return res.status(401).json({
        statusCode: 401,
        message: 'Something went wrong, plan subscription failed.',
        success: false,
      });
    }
  }

  async getUserSubscriptions(userId: object, res: any) {
    try {
      const subscriptions = await this.subscriptionModel.find({ userId, status: "active" }).exec();
  
      if (!subscriptions || subscriptions.length === 0) {
        return res.status(404).json({
          statusCode: 404,
          message: 'No active subscriptions found for this user.',
          success: false,
        });
      }
  
      console.log('User Active Subscriptions Data:', subscriptions);
  
      return res.status(200).json({
        statusCode: 200,
        message: 'Active subscriptions retrieved successfully.',
        success: true,
        data: subscriptions,
      });
    } catch (error) {
      return res.status(500).json({
        statusCode: 500,
        message: 'Error retrieving active subscriptions.',
        success: false,
        error: error.message,
      });
    }
  }
  


  async updateSubscription(
    details: { userId: string; subscriptionId: string; status: string },
  res:any,
    req:any
  ) {
    try {
      console.log("Updating subscription for user:", details.userId, "Subscription ID:", details.subscriptionId);

      // Find the subscription that belongs to the user
      const existingSubscription = await this.subscriptionModel.findOne({
        _id: details.subscriptionId,
        userId: details.userId, // Ensure the subscription belongs to the user
      });

      if (!existingSubscription) {
        return res.status(404).json({
          statusCode: 404,
          message: "Subscription not found or does not belong to the user.",
          success: false,
        });
      }

      // Update the status
      existingSubscription.status = details.status;

      // Save the updated subscription
      const updatedSubscription = await existingSubscription.save();

      return res.status(200).json({
        statusCode: 200,
        message: "Subscription updated successfully.",
        success: true,
        subscriptionId: updatedSubscription._id.toString(),
        endDate: updatedSubscription.endDate,
        status: updatedSubscription.status, // Return updated status for confirmation
      });
    } catch (error) {
      console.error("❌ Error updating subscription:", error);
      return res.status(500).json({
        statusCode: 500,
        message: "An error occurred while updating the subscription.",
        success: false,
      });
    }
  }




  

}












