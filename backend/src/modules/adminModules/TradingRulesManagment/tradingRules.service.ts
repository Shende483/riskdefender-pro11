import { Injectable, Res } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Response } from 'express';
import { CreateTradingRulesDto } from './dto/tradingRules.dto';
import { TradingRules, TradingRulesDocument } from './tradingRules.schema';
import { CreateRuleDto } from './dto/rules.dto';
import { MarketType } from '../MarketType/marketType.schema';
import { isValidObjectId } from 'mongoose';

const ObjectId = Types.ObjectId;

@Injectable()
export class TradingRulesService {
  constructor(
    @InjectModel(TradingRules.name)
    private tradingRulesModel: Model<TradingRulesDocument>,
    @InjectModel(MarketType.name) private marketTypeModel: Model<MarketType>,
  ) {}

  async createTradingRules(
    tradingRulesDto: CreateTradingRulesDto,
    res: Response,
  ): Promise<TradingRulesDocument | void> {
    const { marketTypeId, rules } = tradingRulesDto;

    const marketType = await this.marketTypeModel.findById(marketTypeId);
    if (!marketType) {
      res.status(400).json({
        statusCode: 400,
        message: '❌ Market type does not exist.',
        success: false,
      });
      return; // Explicit return to avoid further execution
    }

    try {
      const addRules = new this.tradingRulesModel({
        marketTypeId,
        rules,
      });
      const savedRules = await addRules.save();
      console.log('✅ Trading rules created successfully:', savedRules);

      res.status(200).json({
        statusCode: 200,
        message: '✅ Trading rules created successfully.',
        success: true,
        data: savedRules,
      });
    } catch (error) {
      console.error('❌ Error saving broker:', error);
      res.status(500).json({
        statusCode: 500,
        message: '❌ Something went wrong. Trading rules not saved.',
        success: false,
      });
    }
  }

  async getTradingRules(@Res() res: Response) {
    try {
      const tradingRules = await this.tradingRulesModel.find().exec();
      res.status(200).json({
        statusCode: 200,
        message: '✅ Trading rules fetched successfully.',
        success: true,
        data: tradingRules,
      });
    } catch (error) {
      console.error('❌ Error retrieving trading rules:', error);
      res.status(500).json({
        statusCode: 500,
        message: '❌ Something went wrong. Unable to fetch trading rules.',
        success: false,
      });
    }
  }

  // async getRulesByMarketTypeId(
  //   marketTypeId: string,
  // ): Promise<TradingRulesDocument[]> {
  //   try {
  //     console.log('🔹NEwwwww Received marketTypeId:', marketTypeId);
  //     return this.tradingRulesModel
  //       .find({
  //         marketTypeId: new ObjectId(marketTypeId)

  //       })
  //       .exec();
  //   } catch (error) {
  //     console.error('❌ Error retrieving trading rules:', error);
  //     throw error;
  //   }
  // }

  async getRulesByMarketTypeId(
    marketTypeId: string,
  ): Promise<TradingRulesDocument[]> {
    try {
      console.log('🔹 Service - Received marketTypeId:', marketTypeId);

      if (!marketTypeId) {
        throw new Error('marketTypeId is required');
      }

      if (!Types.ObjectId.isValid(marketTypeId)) {
        throw new Error('Invalid marketTypeId: Must be a valid ObjectId');
      }

      const result = await this.tradingRulesModel
        .find({
          marketTypeId: new Types.ObjectId(marketTypeId),
        })
        .exec();

      console.log('🔹 Service - Query result:', result);
      return result;
    } catch (error) {
      console.error('❌ Error retrieving trading rules:', error.message);
      throw error;
    }
  }

}
