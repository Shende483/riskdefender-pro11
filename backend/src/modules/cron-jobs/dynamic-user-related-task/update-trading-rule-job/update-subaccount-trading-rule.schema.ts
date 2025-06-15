import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type PendingUpdateDocument = HydratedDocument<PendingUpdate>;

@Schema({ timestamps: true })
export class PendingUpdate {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'BrokerAccount',
    required: true,
  })
  brokerAccountId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  updateStart: Date; // Start of the 24-hour update window (after 5 days)

  @Prop({ required: true })
  updateEnd: Date; // End of the 24-hour update window
}

export const PendingUpdateSchema = SchemaFactory.createForClass(PendingUpdate);