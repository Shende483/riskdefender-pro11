import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PenaltyPlanDocument = HydratedDocument<PenaltyPlan>;

class Price {
  @Prop({ type: Number, required: true })
  INR: number;

  @Prop({ type: Number, required: true })
  USD: number;

  @Prop({ type: Number, required: true })
  EUR: number;

  @Prop({ type: Number, required: true })
  GBP: number;

  @Prop({ type: Number, required: true })
  AED: number;

  @Prop({ type: Number, required: true })
  SGD: number;

  @Prop({ type: Number, required: true })
  CAD: number;

  @Prop({ type: Number, required: true })
  AUD: number;
}

@Schema({ timestamps: { createdAt: 'createdDate', updatedAt: 'modifiedDate' } })
export class PenaltyPlan {


 @Prop({ required: true })
  name: string;

@Prop({ required: true })
 penaltyName: string;

  @Prop({ required: true, type: Price })
  price: Price;

  @Prop({ type: Number, default: 0 })
  discountPercent: number;


  @Prop({ required: true })
  description: string;

  @Prop({ type: Number, default: 18 })
  gstRate: number;

  @Prop({ required: true, enum: ['active', 'inactive'], default: 'active' })
  status: string;
}

export const PenaltyPlanDetailsSchema = SchemaFactory.createForClass(PenaltyPlan);



