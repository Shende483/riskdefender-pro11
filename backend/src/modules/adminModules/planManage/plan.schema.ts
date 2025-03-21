import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: { createdAt: 'createdDate', updatedAt: 'modifiedDate' } })

export class Plan extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop({required: true, enum: ['monthly', 'annual'] })
  billingCycle: string;

  @Prop({ required: true })
  features: string[];

  @Prop({ default: 'active', enum: ['active', 'inactive'] })
  status: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const PlanDetailsSchema = SchemaFactory.createForClass(Plan);
