import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type TradingJournalManagementDocument = HydratedDocument<TradingJournalManagement>;

@Schema({ timestamps: true })
export class TradingJournalManagement {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, default: 0 })
  myTradingJournalLimit: number;
}

export const TradingJournalManagementSchema = SchemaFactory.createForClass(TradingJournalManagement);