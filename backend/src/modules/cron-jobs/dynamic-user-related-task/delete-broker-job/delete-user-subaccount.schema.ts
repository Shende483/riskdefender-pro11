import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type PendingDeletionDocument = HydratedDocument<PendingDeletion>;

@Schema({ timestamps: true })
export class PendingDeletion {
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
  deleteAt: Date;
}

export const PendingDeletionSchema = SchemaFactory.createForClass(PendingDeletion);