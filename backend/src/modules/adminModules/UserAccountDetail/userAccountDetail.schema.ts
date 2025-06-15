import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true, collection: 'userAccountTemplates' })
export class UserAccountDetails {
    @Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: 'MarketType',
        required: true,
    })
    marketTypeId: MongooseSchema.Types.ObjectId;

    @Prop({ type: String, enum: ['Cash', 'Future', 'Option'], required: true })
    orderType: string;

    @Prop({ type: Number, required: true, min: 0 })
    availableBalance: number;

    @Prop({ type: Number, required: true, min: 0 })
    todaysEntryCount: number;

    @Prop({ type: Number, required: true, min: 0 })
    entryCountInSymbol: number;

    @Prop({
        type: String,
        enum: ['active', 'inactive'],
        required: true,
        default: 'active'
    })
    status: string;
}

export type UserAccountDetailsDocument = HydratedDocument<UserAccountDetails>;
export const UserAccountDetailsSchema = SchemaFactory.createForClass(UserAccountDetails);