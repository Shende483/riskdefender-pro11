import { Types } from 'mongoose';

export class CreateTradingRulesDto {
  userId: Types.ObjectId;
  accountName: string;
  apiKey: string;
  secretKey: string;
  brokerName: string;
  marketType: string;
  tradingRuleData: {
    cash?: Record<string, any>;
    option?: Record<string, any>;
    future?: Record<string, any>;
  };
}

export class UpdateTradingRulesDto {
  accountName?: string;
  apiKey?: string;
  secretKey?: string;
  brokerName?: string;
  marketType?: string;
  tradingRuleData?: {
    cash?: Record<string, any>;
    option?: Record<string, any>;
    future?: Record<string, any>;
  };
}