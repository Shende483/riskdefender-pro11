import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, HydratedDocument } from 'mongoose';

@Schema()
export class TradingRules {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'MarketType',
    required: true,
  })
  marketTypeId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: {
      cash: [{ type: String }],
      option: [{ type: String }],
      future: [{ type: String }],
    },
    required: true,
  })
  rules: {
    cash: string[];
    option: string[];
    future: string[];
  };
}

export type TradingRulesDocument = HydratedDocument<TradingRules>;
export const TradingRulesSchema = SchemaFactory.createForClass(TradingRules);