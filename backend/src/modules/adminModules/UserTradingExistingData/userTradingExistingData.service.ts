import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Response } from 'express';
import { MarketType } from '../MarketType/marketType.schema';
import { UserTradingExistingDto } from './dto/UserTradingExistingData.dto';
import { UserTradingExistingData, UserTradingExistingDocument } from './userTradingExistingData.schema';

@Injectable()
export class UserTradingExistingService {
    constructor(
        @InjectModel(UserTradingExistingData.name)
        private readonly userTradingModel: Model<UserTradingExistingDocument>,

        @InjectModel(MarketType.name)
        private readonly marketTypeModel: Model<MarketType>,
    ) { }

    async createTemplate(
        createDto: UserTradingExistingDto, res: Response,
    ): Promise<UserTradingExistingDocument | void> {
        const { marketTypeId } = createDto;

        const marketType = await this.marketTypeModel.findById(marketTypeId);
        if (!marketType) {
            res.status(400).json({
                statusCode: 400,
                message: '❌ Market type does not exist.',
                success: false,
            },

            );
        }

        try {
            const createdDoc = new this.userTradingModel({ ...createDto });
            const savedDoc = await createdDoc.save();
            console.log('✅ Created successfully:', savedDoc);
            res.status(200).json({
                statusCode: 200,
                message: '✅ User trading existing data template created successfully.',
                success: true,
                data: savedDoc,
            });
            return;
            
        } catch (error) {
            console.error('❌ Error saving user trading template:', error);
            res.status(500).json({
                statusCode: 500,
                message: '❌ Failed to create user trading details template.',
                success: false,
            },

            );
        }
    }
}
