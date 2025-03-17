import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TradingRulesDocument = HydratedDocument<TradingRules>;

@Schema({ timestamps: true }) // Enables automatic `createdAt` and `updatedAt` fields
export class TradingRules {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true }) // References the User collection
  userId: Types.ObjectId;

  @Prop({ required: true }) // Required field for the account name
  accountName: string;

  @Prop({ required: true }) // Required field for the API key
  apiKey: string;

  @Prop({ required: true }) // Required field for the secret key
  secretKey: string;

  @Prop({ required: true }) // Required field for the broker name
  brokerName: string;

  @Prop({ required: true }) // Required field for the market type
  marketType: string;

  @Prop({ type: Object, required: true }) // Flexible object to store trading rules
  tradingRuleData: {
    cash?: Record<string, any>; // Optional field for cash trading rules
    option?: Record<string, any>; // Optional field for option trading rules
    future?: Record<string, any>; // Optional field for future trading rules
  };
}

export const TradingRulesSchema = SchemaFactory.createForClass(TradingRules);