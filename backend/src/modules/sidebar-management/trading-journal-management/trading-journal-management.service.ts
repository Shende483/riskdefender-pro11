import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TradingJournalManagement, TradingJournalManagementDocument } from './trading-journal-management.schema';




@Injectable()
export class TradingJournalService {
  constructor(
    @InjectModel(TradingJournalManagement.name)
    private readonly tradingJournalManagementModel: Model<TradingJournalManagementDocument>,
  ) {}

  async getTradingJournalLimits(userId: string) {
    try {
      console.log('Fetching trading journal limits for user:', userId);

      if (!Types.ObjectId.isValid(userId)) {
        return {
          statusCode: 200,
          message: 'Invalid user ID',
          success: false,
          data: [],
        };
      }

      const journals = await this.tradingJournalManagementModel
        .find({ userId: new Types.ObjectId(userId) })
        .exec();

      if (!journals || journals.length === 0) {
        return {
          statusCode: 200,
          message: 'No trading journal data found for user',
          success: false,
          data: [],
        };
      }

      const formattedJournals = journals.map((journal) => {
        const plainJournal = journal.toObject();
        return {
          _id: plainJournal._id.toString(),
          tradingJournalLimit: plainJournal.myTradingJournalLimit,
        };
      });

      console.log('Trading journal limits retrieved successfully:', formattedJournals);
      return {
        statusCode: 200,
        message: formattedJournals.length > 0 ? 'Trading journal data retrieved successfully' : 'No trading journal data found',
        success: formattedJournals.length > 0,
        data: formattedJournals,
      };
    } catch (error) {
      console.error('Error fetching trading journal data:', error);
      return {
        statusCode: 500,
        message: 'Error fetching trading journal data',
        success: false,
        data: [],
      };
    }
  }
}