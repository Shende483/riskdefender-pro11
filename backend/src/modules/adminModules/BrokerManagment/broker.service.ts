import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Broker } from './broker.schema';
import { CreateBrokerDto } from './dto/broker.dto';
import { Response } from 'express';
import { MarketType } from '../MarketType/marketType.schema';
import { Types } from 'mongoose';
const ObjectId = Types.ObjectId;

export interface BrokerResponse {
  _id: string;
  name: string;
}
@Injectable()
export class BrokersService {
  constructor(
    @InjectModel(Broker.name) private brokerModel: Model<Broker>,
    @InjectModel(MarketType.name) private marketTypeModel: Model<MarketType>,
  ) {}

  async createBroker(
    createBrokerDto: CreateBrokerDto,
    res: Response,
  ): Promise<Broker | void> {
    const { marketTypeId, name, status = 'active' } = createBrokerDto;

    const marketType = await this.marketTypeModel.findById(marketTypeId);
    if (!marketType) {
      res.status(400).json({
        statusCode: 400,
        message: '❌ Market type does not exist.',
        success: false,
      });
    }

    try {
      const newBroker = new this.brokerModel({
        name,
        status,
        marketTypeId: marketTypeId,
      });
      const savedBroker = await newBroker.save();
      console.log('✅ Broker created successfully:', savedBroker);

      res.status(200).json({
        statusCode: 200,
        message: '✅ Broker created successfully.',
        success: true,
        data: savedBroker,
      });
    } catch (error) {
      console.error('❌ Error saving broker:', error);
      res.status(500).json({
        statusCode: 500,
        message: '❌ Something went wrong. Broker not saved.',
        success: false,
      });
    }
  }

  async getActiveBrokers(): Promise<Broker[] | { messege: string }> {
    // return this.brokerModel.find({ status: 'active' }).exec();
    const activebroker = await this.brokerModel
      .find({ status: 'active' })
      .exec();
    if (activebroker.length === 0) {
      return { messege: ' No active broker found' };
    }
    return activebroker;
  }

  async getBrokersByMarketTypeId(
    marketTypeId: string,
  ): Promise<BrokerResponse[]> {
    try {
      const brokers = await this.brokerModel
        .find({ marketTypeId: new ObjectId(marketTypeId), status: 'active' })
        .select('_id name') 
        .exec();

      return brokers.map((broker) => ({
        _id: broker._id.toString(),
        name: broker.name,
      }));
    } catch (error) {
      console.error('Error fetching brokers:', error);
      throw error;
    }
  }
}
