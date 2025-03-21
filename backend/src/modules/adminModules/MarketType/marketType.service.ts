import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MarketType } from './marketType.schema';

@Injectable()
export class MarketTypeService {
  constructor(
    @InjectModel(MarketType.name) private marketTypeModel: Model<MarketType>,
  ) {}

  async createMarketType(data: { name: string; status: string }) {
    const newMarketType = new this.marketTypeModel({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return newMarketType.save();
  }

  async getAllActiveMarketTypes() {
    return this.marketTypeModel.find({ status: 'active' }).exec();
  }
}
