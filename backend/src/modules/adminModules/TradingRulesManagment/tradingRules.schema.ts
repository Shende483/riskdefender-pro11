import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Rule, RuleSchema } from './rules.schema';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class TradingRules {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'MarketType',
    required: true,
  })
  marketTypeId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: {
      cash: [RuleSchema],
      option: [RuleSchema],
      future: [RuleSchema],
    },
    required: true,
  })
  rules: {
    cash: Rule[];
    option: Rule[];
    future: Rule[];
  };
}
export type TradingRulesDocument = HydratedDocument<TradingRules>;
export const TradingRulesSchema = SchemaFactory.createForClass(TradingRules);
