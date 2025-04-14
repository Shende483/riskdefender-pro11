import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Response } from 'express';
import { MarketType } from '../adminModules/MarketType/marketType.schema';
import { OrderPlacementDto } from './dto/orderPlacement.dto';
import { OrderPlacementType, OrderPlacementDocument } from './orderPlacement.schema';

@Injectable()
export class OrderPlacementService {
  constructor(
    @InjectModel(MarketType.name) private marketTypeModel: Model<MarketType>,
    @InjectModel(OrderPlacementType.name)
    private orderPlacementModel: Model<OrderPlacementDocument>,
  ) {}

  async createOrderTemplate(
    createOrderDto: OrderPlacementDto,
    res: Response,
  ): Promise<OrderPlacementType | void> {
    const {
      marketTypeId,
      orderType,
      orderPlacingType,
      symbol,
      allowedDirection,
      marginTypes,
      maxLeverage,
      maxRiskPercentage,
      stopLoss,
      targetPrice,
      status = 'active',
    } = createOrderDto;

    const marketType = await this.marketTypeModel.findById(marketTypeId);
    if (!marketType) {
      res.status(400).json({
        statusCode: 400,
        message: '❌ Market type does not exist.',
        success: false,
      });
    }

    try {
      const newOrderTemplate = new this.orderPlacementModel({
        marketTypeId: marketTypeId,
        orderType,
        orderPlacingType,
        symbol,
        allowedDirection,
        marginTypes,
        maxLeverage,
        maxRiskPercentage,
        stopLoss,
        targetPrice,
        status,
      });
      // const savedOrderTemplate = await newOrderTemplate.save();
      console.log('Order Template Created Successfully', newOrderTemplate);

      res.status(200).json({
        statusCode: 200,
        messege: 'Order Template Created Successfully',
        success: true,
        data: newOrderTemplate,
      });
    } catch (error) {
      console.error('❌ Error saving Order Template:', error);
      res.status(500).json({
        statusCode: 500,
        messege: '❌ Order Template not created failed',
        success: false,
      });
    }
  }
}
