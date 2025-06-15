import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type AlertManagementDocument = HydratedDocument<AlertManagement>;

@Schema({ timestamps: true })
export class AlertManagement {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, default: 0 })
  myAlertLimit: number;

  
}

export const AlertManagementSchema = SchemaFactory.createForClass(AlertManagement);