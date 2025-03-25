import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Document } from 'mongoose';

@Schema()
export class TradingRules extends Document {
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

export const TradingRulesSchema = SchemaFactory.createForClass(TradingRules);
