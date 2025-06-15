import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type PenaltyPaymentDocument = HydratedDocument<PenaltyPayment>;

@Schema({ timestamps: true })
export class PenaltyPayment {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'BrokerAccounts', required: false })
  brokerAccountId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'PenaltyPlan', required: true })
  penaltyPlanId: MongooseSchema.Types.ObjectId;

  @Prop({ type: String, required: true })
  paymentType: string;

  @Prop({ type: String, default: '' })
  couponCode: string;

  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({ type: String, required: true })
  currency: string;

  @Prop({ type: String })
  razorpayPaymentId: string;

  @Prop({ type: String, required: true })
  orderId: string;

  @Prop({ type: String, enum: ['pending', 'success', 'failed'], required: true })
  paymentStatus: string;

  @Prop({ type: Date, required: true })
  paymentDate: Date;
}

export const PenaltyPaymentSchema = SchemaFactory.createForClass(PenaltyPayment);