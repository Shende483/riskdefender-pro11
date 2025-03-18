import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SubscriptionDetailsDocument = HydratedDocument<SubscriptionDetails>;

@Schema({ timestamps: true })
export class SubscriptionDetails {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  planName: string;

  @Prop({ required: true })
  numberOfBroker: number;

  @Prop({ required: true })
  activeDateTime: Date;

  @Prop({ required: true })
  expireDateTime: Date;

  @Prop({ required: true })
  transactionId: string;

  @Prop({ required: true })
  transactionDate: Date;

  @Prop({ required: true })
  status: string;
}

export const SubscriptionDetailsSchema = SchemaFactory.createForClass(SubscriptionDetails);
