import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type TradingJournalPaymentDocument = HydratedDocument<TradingJournalPayment>;

@Schema({ timestamps: true })
export class TradingJournalPayment {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Plan', required: true })
  tradingJournalPlanId: MongooseSchema.Types.ObjectId;

  @Prop({ type: Number, required: true, default: 0 })
  tradingJournalLimit: number;

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

export const TradingJournalPaymentSchema = SchemaFactory.createForClass(TradingJournalPayment);