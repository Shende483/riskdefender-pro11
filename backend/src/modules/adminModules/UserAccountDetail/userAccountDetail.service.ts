import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Response } from 'express';
import { CreateUserAccountDetailsDto } from './dto/userAccountDetail.dto';
import { UserAccountDetails, UserAccountDetailsDocument } from './userAccountDetail.schema';
import { MarketType } from '../MarketType/marketType.schema';

@Injectable()
export class UserAccountDetailsService {
    constructor(
        @InjectModel(UserAccountDetails.name)
        private readonly userAccountModel: Model<UserAccountDetailsDocument>,

        @InjectModel(MarketType.name)
        private readonly marketTypeModel: Model<MarketType>,
    ) { }

    async createTemplate(
        createDto: CreateUserAccountDetailsDto, res: Response,
    ): Promise<UserAccountDetailsDocument | void> {
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
            const createdDoc = new this.userAccountModel({ ...createDto });
            const savedDoc = await createdDoc.save();
            console.log('✅ Created successfully:', savedDoc);
            res.status(200).json({
                statusCode: 200,
                message: '✅ Trading rules created successfully.',
                success: true,
                data: savedDoc,
            });
            return;
            
        } catch (error) {
            console.error('❌ Error saving user account template:', error);
            res.status(500).json({
                statusCode: 500,
                message: '❌ Failed to create user account details template.',
                success: false,
            },

            );
        }
    }
}
