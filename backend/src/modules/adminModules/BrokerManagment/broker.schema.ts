import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type BrokerDocument = HydratedDocument<Broker>;

@Schema({ timestamps: { createdAt: 'createdDate', updatedAt: 'modifiedDate' } })
export class Broker {
  @Prop({ required: true })
  name: string;

  @Prop({ default: 'active', enum: ['active', 'inactive'] })
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
