import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BrokerAccount, BrokerAccountDocument } from './brokerAcount.schema';
import { Model, Types } from 'mongoose';
import {
  Subscription,
  SubscriptionDocument,
} from 'src/modules/SubcriptionDetails/subcription.schema';
import { Response } from 'express';
import { BrokerAccountDto } from './dto/brokerAccount.dto';
import {
  User,
  UserDocument,
} from 'src/modules/auth/updateUserInfoAuth/UserUpdateInfo.schema';
import {
  Broker,
  BrokerDocument,
} from '../adminModules/BrokerManagment/broker.schema';
import {
  MarketType,
  MarketTypeSchema,
} from '../adminModules/MarketType/marketType.schema';

const ObjectId = Types.ObjectId;

@Injectable()
export class BrokerAccountService {
  constructor(
    @InjectModel(BrokerAccount.name)
    private readonly brokerAccountModel: Model<BrokerAccountDocument>,
    @InjectModel(Broker.name)
    private readonly brokerModel: Model<BrokerDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(MarketType.name)
    private readonly marketTypeModel: Model<MarketTypeSchema>,
    @InjectModel(Subscription.name)
    private readonly subscriptionModel: Model<SubscriptionDocument>,
  ) { }

  async createBrokerAccount(
    brokerAcoountdto: BrokerAccountDto,
    res: Response,
  ): Promise<BrokerAccount | void> {
    const {
      brokerId,
      marketTypeId,
      userId,
      subscriptionId,
      brokerAccountName,
      apiKey,
      secretKey,
      status,
      tradingRuleData,
    } = brokerAcoountdto;

    const brokerType = await this.brokerModel.findById(
      brokerAcoountdto.brokerId,
    );
    if (!brokerType) {
      res.status(400).json({
        statusCode: 400,
        messege: 'Broker type does not exist',
        status: false,
      });
    }
    const marketType = await this.marketTypeModel.findById(marketTypeId);
    if (!marketType) {
      res.status(400).json({
        statusCode: 400,
        messege: 'Market type does not exist',
        status: false,
      });
    }
    const userType = await this.userModel.findById(userId);
    if (!userType) {
      res.status(400).json({
        statusCode: 400,
        messege: 'user type does not exist',
        status: false,
      });
    }
    const subscriptionType =
      await this.subscriptionModel.findById(subscriptionId);
    if (!subscriptionType) {
      res.status(400).json({
        statusCode: 400,
        messege: 'Subscription type does not exist',
        status: false,
      });
    }

    try {
      const newBrokerAcc = new this.brokerAccountModel({
        brokerId,
        marketTypeId,
        subscriptionId,
        userId,
        brokerAccountName,
        apiKey,
        secretKey,
        status,
        tradingRuleData,
      });
      const savedBrokerAccount = await newBrokerAcc.save();
      console.log(
        '✅ Broker Account created successfully:',
        savedBrokerAccount,
      );

      res.status(200).json({
        statusCode: 200,
        message: '✅ Broker Account created successfully.',
        success: true,
        data: savedBrokerAccount._id,
      });
    } catch (error) {
      console.error('❌ Error saving broker:', error);
      res.status(500).json({
        statusCode: 500,
        message: '❌ Something went wrong. Broker Account not saved.',
        success: false,
      });
    }
  }

  async getBrokerDetailsByUserIdAndMarketType(
    userId: string,
    marketTypeId: string,
  ) {
    try {
      const brokerAccounts = await this.brokerAccountModel
        .find({
          marketTypeId: new ObjectId(marketTypeId),
          userId: new ObjectId(userId),
          brokerId: { $exists: true, $ne: null },
        })
        .populate<{ brokerId: Pick<Broker, 'name'> | null }>('brokerId', 'name')
        .select('_id brokerAccountName') // Added _id here
        .exec();

      return brokerAccounts.map((account) => {
        if (!account.brokerId) {
          console.log(
            `Broker account ${account._id} has no valid broker reference`,
          );
          return {
            statusCode: 401,
            _id: account._id.toString(), // Added ID here
            brokerAccountName: account.brokerAccountName,
            brokerName: 'Unknown Broker',
            message: 'Broker reference missing',
            success: false,
          };
        }
        return {
          statusCode: 200,
          _id: account._id.toString(), // Added ID here
          brokerAccountName: account.brokerAccountName,
          brokerName: account.brokerId.name,
          success: true,
        };
      });
    } catch (error) {
      console.error('Error fetching broker details:', error);
      return {
        statusCode: 401,
        message: 'Error fetching broker details',
        success: false,
      };
    }
  }

  // brokerAccount.service.ts

  // brokerAccount.service.ts
  async getTradingRulesByBrokerAccountId(id: string, userId: string) {
    // Add more robust validation
    if (!id || id === 'undefined' || id === 'null') {
      throw new Error('Broker account ID is required');
    }

    if (!Types.ObjectId.isValid(id)) {
      console.error('Invalid ID received:', id); // Log the bad ID
      throw new Error(`Invalid ID format: ${id}`);
    }

    if (!Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID format');
    }

    try {
      const brokerAccount = await this.brokerAccountModel.findOne({
        _id: new Types.ObjectId(id),
        userId: new Types.ObjectId(userId)
      }).select('tradingRuleData brokerAccountName').lean();

      if (!brokerAccount) {
        throw new Error('Broker account not found');
      }

      return {
        brokerAccountName: brokerAccount.brokerAccountName,
        cash: brokerAccount.tradingRuleData?.cash || [],
        option: brokerAccount.tradingRuleData?.option || [],
        future: brokerAccount.tradingRuleData?.future || []
      };
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to retrieve trading rules');
    }
  }

  private parseTradingRules(rules: string[]) {
    return rules.map((rule) => {
      const [key, value] = rule.split(':').map((item) => item.trim());
      return { key, value };
    });
  }
}
