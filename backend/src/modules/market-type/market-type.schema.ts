import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type MarketTypeSchema = HydratedDocument<MarketType> 
@Schema({ timestamps: true })
export class MarketType {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ['active', 'inactive'] })
  status: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}


export const MarketTypeSchema = SchemaFactory.createForClass(MarketType);