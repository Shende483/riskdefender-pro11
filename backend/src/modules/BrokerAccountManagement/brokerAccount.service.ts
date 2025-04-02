import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BrokerAccount, BrokerAccountDocument } from './brokerAcount.schema';
import { Model } from 'mongoose';
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
  ) {}

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
        data: savedBrokerAccount,
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
}
