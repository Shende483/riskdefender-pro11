import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: { createdAt: 'createdDate', updatedAt: 'modifiedDate' } })
export class Broker extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ default: 'active' })
  status?: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'MarketType',
    required: true,
  })
  marketTypeId: MongooseSchema.Types.ObjectId;

  @Prop()
  createdDate: Date;

  @Prop()
  modifiedDate: Date;
}

export const BrokerSchema = SchemaFactory.createForClass(Broker);
