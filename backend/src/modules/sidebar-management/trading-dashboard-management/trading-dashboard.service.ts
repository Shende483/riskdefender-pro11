

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BrokerAccount, BrokerAccountDocument } from './trading-dashboard.schema';

import { Model, Types } from 'mongoose';
import { Response } from 'express';
import {
  User,
  UserDocument,
} from 'src/modules/auth/updateUserInfoAuth/UserUpdateInfo.schema';
import {
  Broker,
  BrokerDocument,
} from '../../adminModules/BrokerManagment/broker.schema';
import {
  MarketType,
  MarketTypeSchema,
} from '../../adminModules/MarketType/marketType.schema';
import { SubbrokerPayment, SubbrokerPaymentDocument } from 'src/modules/payment-management/multiple-payment-schema/subbroker-payment.schema';

const ObjectId = Types.ObjectId;

@Injectable()
export class BrokerAccountService {
  constructor(
    @InjectModel(BrokerAccount.name)
    private readonly brokerAccountModel: Model<BrokerAccountDocument>,
    @InjectModel(SubbrokerPayment.name)
    private readonly subbrokerPaymentModel: Model<SubbrokerPaymentDocument>,
    @InjectModel(Broker.name)
    private readonly brokerModel: Model<BrokerDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(MarketType.name)
    private readonly marketTypeModel: Model<MarketTypeSchema>,
  ) {}

  async validateUserAndMarketType(userId: string, marketTypeId: string, res: Response) {
    const userType = await this.userModel.findById(userId);
    if (!userType) {
      res.status(400).json({
        statusCode: 400,
        message: 'User type does not exist',
        status: false,
      });
      return false;
    }

    const marketType = await this.marketTypeModel.findById(marketTypeId);
    if (!marketType) {
      res.status(400).json({
        statusCode: 400,
        message: 'Market type does not exist',
        status: false,
      });
      return false;
    }

    return true;
  }


  async getBrokerDetailsByUserIdAndMarketType(userId: string, marketTypeId: string) {
    try {
      console.log('We received request for broker details');
      const brokerAccounts = await this.brokerAccountModel
        .find({
          marketTypeId: marketTypeId,
          userId: new ObjectId(userId),
          status: 'active',
          brokerId: { $exists: true, $ne: null },
        })
        .populate('brokerId', '_id name')
        .select('_id brokerAccountName')
        .exec();

      return brokerAccounts.map((account) => {
        console.log('account', account);
        if (!account.brokerId || typeof account.brokerId === 'string' || account.brokerId instanceof ObjectId) {
          console.log(`Broker account ${account._id} has no valid broker reference`);
        }
        return {
          statusCode: 200,
          _id: account._id,
          brokerId: (account.brokerId as unknown as { _id: Types.ObjectId })._id.toString(),
          brokerName: (account.brokerId as { name?: string }).name || 'Unknown Broker',
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


  async getSubBrokerDetailsByMarketTypeAndBrokerId(
    userId: string,
    marketTypeId: string,
    brokerId: string,
  ) {
    try {
      console.log('Received request for sub-broker details');
      if (!Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid user ID');
      }
      if (!Types.ObjectId.isValid(brokerId)) {
        throw new Error('Invalid broker ID');
      }

      const subBrokerAccounts = await this.brokerAccountModel
        .find({
          userId: new ObjectId(userId),
          marketTypeId: marketTypeId,
          brokerId: new ObjectId(brokerId),
          status: 'active',
          proxyServiceId: { $exists: true, $ne: null },
        })
        .select('_id subAccountName')
        .exec();

      console.log('Sub-broker accounts:', subBrokerAccounts);

      if (!subBrokerAccounts.length) {
        return {
          statusCode: 404,
          message: 'No active sub-brokers with proxy service found',
          success: false,
          data: [],
        };
      }

      return subBrokerAccounts.map((account) => ({
        statusCode: 200,
        subBrokerId: account._id.toString(),
        subBrokerName: account.subAccountName || 'Unknown Sub-Broker',
        success: true,
      }));
    } catch (error) {
      console.error('Error fetching sub-broker details:', error);
      return {
        statusCode: 400,
        message: error.message || 'Failed to retrieve sub-broker details',
        success: false,
      };
    }
  }

  
async getTradingRules(userId: string, subBrokerId: string, tradingType: string) {
    try {
      // Validate inputs
      if (!Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid user ID');
      }
      if (!Types.ObjectId.isValid(subBrokerId)) {
        throw new Error('Invalid sub-broker ID');
      }
      if (!tradingType || !['cash', 'option', 'future'].includes(tradingType)) {
        throw new Error('Invalid trading type');
      }

      // Fetch broker account
      const brokerAccount = await this.brokerAccountModel
        .findOne({
          _id: new Types.ObjectId(subBrokerId),
          userId: new Types.ObjectId(userId),
          [`tradingRuleData.${tradingType}`]: { $exists: true },
        })
        .select(`tradingRuleData.${tradingType} subAccountName currentBrokerPaymentId`)
        .lean();

      if (!brokerAccount) {
        throw new Error('Broker account or trading rules not found');
      }
      console.log('Broker account:', brokerAccount);

      // Validate currentBrokerPaymentId
      const paymentId = (brokerAccount as any).currentBrokerPaymentId;
      if (!paymentId || !Types.ObjectId.isValid(paymentId)) {
        throw new Error('Invalid or missing payment ID');
      }

      // Fetch payment details for plan expiry
      const payment = await this.subbrokerPaymentModel
        .findOne({
          _id: new Types.ObjectId(paymentId),
          userId: new Types.ObjectId(userId),
        })
        .select('endDate planStatus')
        .lean();

      if (!payment) {
        throw new Error('Payment details not found');
      }
      console.log('Payment details:', payment);

      const tradingRules = brokerAccount.tradingRuleData?.[tradingType] || [];
      const parsedRules = this.parseTradingRules(tradingRules);

      // Calculate plan expiry and deletion details
      const now = new Date();
      const endDate = new Date(payment.endDate);
      const timeDiff = endDate.getTime() - now.getTime();
      const daysLeft = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hoursLeft = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutesLeft = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const secondsLeft = Math.floor((timeDiff % (1000 * 60)) / 1000);

      let planExpiryMessage: string | null = null;
      let deletionMessage: string | null = null;
      let extraDaysMessage: string | null = null;

      // Format expiry date for frontend (e.g., "12-7-2025 04:06:10")
      const expiryDate = endDate.toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).replace(',', '');

      // 1. Plan expiry notification (≤15 days remaining)
      if (daysLeft <= 15 && daysLeft >= 0 && payment.planStatus === 'active') {
       // planExpiryMessage = `Your plan expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}, ${hoursLeft} hour${hoursLeft !== 1 ? 's' : ''}, ${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''}, ${secondsLeft} second${secondsLeft !== 1 ? 's' : ''}.`;
       planExpiryMessage = `Your plan expires at :${endDate}, Only ${daysLeft} day left `
        const extraDays = daysLeft >= 11 ? 15 : daysLeft;
        const extraHours = daysLeft === 0 ? hoursLeft : 0;
        if (extraDays > 0) {
          extraDaysMessage = `Renew now to get ${extraDays} extra day${extraDays !== 1 ? 's' : ''} on your plan!`;
        } else if (extraHours > 0) {
          extraDaysMessage = `Renew now to get ${extraHours} extra hour${extraHours !== 1 ? 's' : ''} on your plan!`;
        }
      }

      // 2. Post-expiry notifications (within 15 days after expiry)
      if (payment.planStatus === 'expired') {
        const deletionDate = new Date(endDate.getTime() + 15 * 24 * 60 * 60 * 1000);
        const deletionTimeDiff = deletionDate.getTime() - now.getTime();
        const deletionDaysLeft = Math.floor(deletionTimeDiff / (1000 * 60 * 60 * 24));
        const deletionHoursLeft = Math.floor((deletionTimeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const deletionMinutesLeft = Math.floor((deletionTimeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const deletionSecondsLeft = Math.floor((deletionTimeDiff % (1000 * 60)) / 1000);

        if (deletionDaysLeft >= 0) {
          deletionMessage = `Your plan expired. Renew within ${deletionDaysLeft} day${deletionDaysLeft !== 1 ? 's' : ''}, ${deletionHoursLeft} hour${deletionHoursLeft !== 1 ? 's' : ''}, ${deletionMinutesLeft} minute${deletionMinutesLeft !== 1 ? 's' : ''}, ${deletionSecondsLeft} second${deletionSecondsLeft !== 1 ? 's' : ''} to avoid account deletion. Open orders and positions will be closed upon deletion.`;
        } else {
          deletionMessage = `Your account is scheduled for deletion. Open orders and positions have been closed.`;
        }
      }

      console.log('Parsed trading rules:', parsedRules);
      return {
        statusCode: 200,
        message: 'Trading rules retrieved successfully',
        success: true,
        data: {
          subBrokerId: subBrokerId,
          subBrokerName: brokerAccount.subAccountName || 'Unknown Sub-Broker',
          tradingType: tradingType,
          tradingRules: parsedRules,
          planDetails: {
            endDate: payment.endDate,
            expiryDate,
            daysLeft,
            hoursLeft,
            minutesLeft,
            secondsLeft,
            planExpiryMessage,
            deletionMessage,
            extraDaysMessage,
          },
        },
      };
    } catch (error) {
      console.error('Error fetching trading rules:', error);
      return {
        statusCode: 400,
        message: error.message || 'Failed to retrieve trading rules',
        success: false,
      };
    }
  }

  private parseTradingRules(rules: any[]) {
    return rules.map((rule) => {
      if (typeof rule === 'object' && rule !== null) {
        return {
          key: rule.key || '',
          value: rule.value || '',
        };
      }
      if (typeof rule === 'string') {
        const [key, value] = rule.split(':').map((item) => item.trim());
        return { key, value };
      }
      console.warn('Invalid rule format:', rule);
      return { key: '', value: '' };
    });
  }

}




/*

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BrokerAccount, BrokerAccountDocument } from './trading-dashboard.schema';
import { Model, Types } from 'mongoose';

import { Response } from 'express';
import { BrokerAccountDto } from './dto/trading-dashboard.dto';
import {
  User,
  UserDocument,
} from 'src/modules/auth/updateUserInfoAuth/UserUpdateInfo.schema';
import {
  Broker,
  BrokerDocument,
} from '../../adminModules/BrokerManagment/broker.schema';
import {
  MarketType,
  MarketTypeSchema,
} from '../../adminModules/MarketType/marketType.schema';

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
    
  ) {}





// The following logic should be inside an async method, for example:

async validateUserAndMarketType(userId: string, marketTypeId: string, res: Response) {
  const userType = await this.userModel.findById(userId);
  if (!userType) {
    res.status(400).json({
      statusCode: 400,
      messege: 'user type does not exist',
      status: false,
    });
    return false;
  }

  const marketType = await this.marketTypeModel.findById(marketTypeId);
  if (!marketType) {
    res.status(400).json({
      statusCode: 400,
      messege: 'Market type does not exist',
      status: false,
    });
    return false;
  }

  return true;
}

// Similarly, move brokerType logic into a method as needed.








// get broker details by userId and marketTypeId
async getBrokerDetailsByUserIdAndMarketType(
  userId: string,
  marketTypeId: string,
) {
  try {
    console.log('we recieved req for broker details');
    const brokerAccounts = await this.brokerAccountModel
      .find({
        marketTypeId: marketTypeId,
        userId: new ObjectId(userId),
        brokerId: { $exists: true, $ne: null },
      })
      .populate('brokerId', '_id name')
      .select('_id brokerAccountName')
      .exec();

    return brokerAccounts.map((account) => {
      console.log('account', account);
      if (!account.brokerId || typeof account.brokerId === 'string' || account.brokerId instanceof ObjectId) {
        console.log(
          `Broker account ${account._id} has no valid broker reference`,
        );
      }
      // account.brokerId is populated Broker document
      return {
        statusCode: 200,
        _id: account._id,
        brokerId: (account.brokerId as unknown as { _id: Types.ObjectId })._id.toString(), // Return brokerId as _id
        brokerName: (account.brokerId as { name?: string }).name || 'Unknown Broker',
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





async getSubBrokerDetailsByMarketTypeAndBrokerId(
  userId: string,
  marketTypeId: string,
  brokerId: string,
) {
  try {
    console.log('Received request for sub-broker details');
    // Validate inputs
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID');
    }
   

    if (!Types.ObjectId.isValid(brokerId)) {
      throw new Error('Invalid broker ID');
    }

    // Fetch sub-broker accounts with active status and proxyServiceId
    const subBrokerAccounts = await this.brokerAccountModel
      .find({
        userId: new ObjectId(userId),
        marketTypeId: marketTypeId,
        brokerId: new ObjectId(brokerId),
        status: 'active',
        proxyServiceId: { $exists: true, $ne: null },
      })
      .select('_id subAccountName')
      .exec();

    console.log("Sub-broker accounts:", subBrokerAccounts);

    if (!subBrokerAccounts.length) {
      return {
        statusCode: 404,
        message: 'No active sub-brokers with proxy service found',
        success: false,
        data: [],
      };
    }

    return subBrokerAccounts.map((account) => ({
      statusCode: 200,
      subBrokerId: account._id.toString(),
      subBrokerName: account.subAccountName || 'Unknown Sub-Broker',
      success: true,
    }));
  } catch (error) {
    console.error('Error fetching sub-broker details:', error);
    return {
      statusCode: 400,
      message: error.message || 'Failed to retrieve sub-broker details',
      success: false,
    };
  }
}





async getTradingRules(userId: string, subBrokerId: string, tradingType: string) {
    try {
      // Validate inputs
      if (!Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid user ID');
      }

      if (!Types.ObjectId.isValid(subBrokerId)) {
        throw new Error('Invalid sub-broker ID');
      }

      if (!tradingType || !['cash', 'option', 'future'].includes(tradingType)) {
        throw new Error('Invalid trading type');
      }

      // Fetch broker account
      const brokerAccount = await this.brokerAccountModel
        .findOne({
          _id: new Types.ObjectId(subBrokerId),
          userId: new Types.ObjectId(userId),
          [`tradingRuleData.${tradingType}`]: { $exists: true },
        })
        .select(`tradingRuleData.${tradingType} subAccountName`)
        .lean();

      if (!brokerAccount) {
        throw new Error('Broker account or trading rules not found');
      }

      const tradingRules = brokerAccount.tradingRuleData?.[tradingType] || [];
      const parsedRules = this.parseTradingRules(tradingRules);
      console.log('Parsed trading rules:', parsedRules);
      return {
        statusCode: 200,
        message: 'Trading rules retrieved successfully',
        success: true,
        data: {
          subBrokerId: subBrokerId,
          subBrokerName: brokerAccount.subAccountName || 'Unknown Sub-Broker',
          tradingType: tradingType,
          tradingRules: parsedRules,
        },
      };
    } catch (error) {
      console.error('Error fetching trading rules:', error);
      return {
        statusCode: 400,
        message: error.message || 'Failed to retrieve trading rules',
        success: false,
      };
    }
  }

  private parseTradingRules(rules: any[]) {
    return rules.map((rule) => {
      if (typeof rule === 'object' && rule !== null) {
        return {
          key: rule.key || '',
          value: rule.value || '',
        };
      }
      if (typeof rule === 'string') {
        const [key, value] = rule.split(':').map((item) => item.trim());
        return { key, value };
      }
      console.warn('Invalid rule format:', rule);
      return { key: '', value: '' };
    });
  }



}


*/

