
import BaseService from '../../../../api-base/axios-base-service';

export interface TradingJournal {
  _id: string;
  tradingJournalLimit: number;
  createdAt: string;
  paymentStatus: string;
}

export interface JournalResponse {
  tradingJournalLimit: undefined;
  length: number;
  statusCode: number;
  success: boolean;
  message: string;
}

export default class TradingJournalService extends BaseService {
  static async getTradingJournalLimits() {
    return this.get<JournalResponse>('/tradingJournal/journal-limits'); // Explicitly set empty params to avoid unwanted query parameters
  }
}