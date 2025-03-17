import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TradingRules } from './tradingRules.schema';
import { CreateTradingRulesDto, UpdateTradingRulesDto } from './dto/tradingRules.dto';

@Injectable()
export class TradingRulesService {
  constructor(
    @InjectModel(TradingRules.name) private tradingRulesModel: Model<TradingRules>,
  ) {}

  // Create new trading rules
  async create(createTradingRulesDto: CreateTradingRulesDto): Promise<TradingRules> {
    try {
      const newTradingRules = new this.tradingRulesModel(createTradingRulesDto);
      return await newTradingRules.save();
    } catch (error) {
      throw new Error(`Failed to create trading rules: ${error.message}`);
    }
  }

  // Get all trading rules
  async findAll(): Promise<TradingRules[]> {
    try {
      return await this.tradingRulesModel.find().exec();
    } catch (error) {
      throw new Error(`Failed to fetch trading rules: ${error.message}`);
    }
  }

  // Get trading rules by ID
  async findOne(id: string): Promise<TradingRules> {
    try {
      const tradingRules = await this.tradingRulesModel.findById(id).exec();
      if (!tradingRules) {
        throw new NotFoundException(`Trading rules with ID ${id} not found`);
      }
      return tradingRules;
    } catch (error) {
      throw new Error(`Failed to fetch trading rules: ${error.message}`);
    }
  }

  // Update trading rules by ID
  async update(id: string, updateTradingRulesDto: UpdateTradingRulesDto): Promise<TradingRules> {
    try {
      const updatedTradingRules = await this.tradingRulesModel
        .findByIdAndUpdate(id, updateTradingRulesDto, { new: true })
        .exec();
      if (!updatedTradingRules) {
        throw new NotFoundException(`Trading rules with ID ${id} not found`);
      }
      return updatedTradingRules;
    } catch (error) {
      throw new Error(`Failed to update trading rules: ${error.message}`);
    }
  }

  // Delete trading rules by ID
  async delete(id: string): Promise<TradingRules> {
    try {
      const deletedTradingRules = await this.tradingRulesModel.findByIdAndDelete(id).exec();
      if (!deletedTradingRules) {
        throw new NotFoundException(`Trading rules with ID ${id} not found`);
      }
      return deletedTradingRules;
    } catch (error) {
      throw new Error(`Failed to delete trading rules: ${error.message}`);
    }
  }
}