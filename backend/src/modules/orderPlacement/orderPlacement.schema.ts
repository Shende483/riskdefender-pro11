import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type OrderPlacementDocument = HydratedDocument<OrderPlacementType>;
@Schema({ timestamps: true })
export class OrderPlacementType {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'MarketType',
    required: true,
  })
  marketTypeId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    enum: ['cash', 'future', 'option'],
    required: true,
  })
  orderType: string;

  @Prop({
    type: String,
    enum: ['Market', 'Limit', 'Stop'],
    required: true,
  })
  orderPlacingType: string;

  @Prop({ required: true })
  symbol: string;

  @Prop({ type: [String], enum: ['SELL', 'BUY'] })
  allowedDirection: string
  @Prop({
    type: [String],
    enum: ['CROSS', 'ISOLATED'],
    required: true,
  })
  marginTypes: string;

  @Prop({
    type: Number,
    min: 1,
    max: 100,
  })
  maxLeverage: number;

  @Prop({
    type: Number,
    min: 0.1,
    max: 100,
  })
  maxRiskPercentage: number;

  @Prop({ type: Number, required: true })
  stopLoss: number;

  @Prop({
    type: Number,
    required: true,
  })
  targetPrice: number;

  @Prop({ type: String, enum: ['active', 'deactive'] })
  status: string;
}

export const OrderPlacementSchema =
  SchemaFactory.createForClass(OrderPlacementType);
