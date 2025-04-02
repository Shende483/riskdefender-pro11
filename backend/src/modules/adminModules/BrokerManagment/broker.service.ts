import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Broker } from './broker.schema';
import { CreateBrokerDto } from './dto/broker.dto';
import { Response } from 'express';
import { MarketType } from '../MarketType/marketType.schema';
import { UpdateBrokerDto } from './dto/updatebroker.dto';

@Injectable()
export class BrokersService {
  deleteBroker(id: string, res: Response<any, Record<string, any>>) {
    throw new Error('Method not implemented.');
  }
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

  async updateBroker(updateBrokerDto: UpdateBrokerDto, res: Response) {
    try {
      const updatedBrokers = await this.brokerModel.findByIdAndUpdate(
        updateBrokerDto._id,
        { name: updateBrokerDto.name, status: updateBrokerDto.status },
        { new: true },
      );

      if (!updatedBrokers) {
        return res.status(404).json({
          statusCode: 404,
          message: '❌ Broker not found.',
          success: false,
        });
      }

      res.status(200).json({
        statusCode: 200,
        message: '✅ Broker updated successfully.',
        success: true,
        data: updatedBrokers,
      });
    } catch (error) {
      console.error('❌ Error updating plan:', error);
      res.status(500).json({
        statusCode: 500,
        message: '❌ Something went wrong.',
        success: false,
      });
    }
  }

  async deleteByIdBroker(id: string, res: Response) {
    try {
      const deletedBroker = await this.brokerModel.findByIdAndDelete(id);

      if (!deletedBroker) {
        return res.status(404).json({
          statusCode: 404,
          message: '❌ Broker not found.',
          success: false,
        });
      }

      res.status(200).json({
        statusCode: 200,
        message: '✅ Broker delete successfully.',
        success: true,
        data: deletedBroker,
      });
    } catch (error) {
      console.error('❌ Error deleteing  plan:', error);
      res.status(500).json({
        statusCode: 500,
        message: '❌ Something went wrong.',
        success: false,
      });
    }
  }
}
