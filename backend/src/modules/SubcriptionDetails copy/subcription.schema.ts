// subscriptionDetails.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SubscriptionDetailsDocument = HydratedDocument<SubscriptionDetails>;

@Schema({ timestamps: true })
export class SubscriptionDetails {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;


  @Prop({ required: true })
  subAccountName: string;

  @Prop({ required: true })
  totalUsedAccount: number;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ required: true })
  status: string;
}

export const SubscriptionDetailsSchema = SchemaFactory.createForClass(SubscriptionDetails);
