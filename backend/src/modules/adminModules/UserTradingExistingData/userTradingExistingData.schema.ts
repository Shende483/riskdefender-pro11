import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true, collection: 'userTradingExistingData' })
export class UserTradingExistingData {
    @Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: 'MarketType',
        required: true,
    })
    marketTypeId: MongooseSchema.Types.ObjectId;

    @Prop({ type: String, enum: ['Cash', 'Future', 'Option'], required: true })
    orderType: string;

    @Prop({ type: Number, required: true, default: 0 })
    myEntryToday: number;

    @Prop({ type: Number, required: true, default: 0 })
    myEntryCountInSymbol: number;

    @Prop({ type: Date, required: false })
    myNextEntryTime: Date;

    @Prop({
        type: String,
        enum: ['active', 'inactive'],
        required: true,
        default: 'active'
    })
    status: string;
}

export type UserTradingExistingDocument = HydratedDocument<UserTradingExistingData>;
export const UserTradingExistingSchema = SchemaFactory.createForClass(UserTradingExistingData);