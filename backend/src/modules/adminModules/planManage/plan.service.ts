import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Response } from 'express';
import { Plan } from './plan.schema';
import { PlanDto } from './planDto/plan.dto';
import { UpdatePlanDto } from './planDto/updateplan.dto';

@Injectable()
export class PlanService {
  constructor(@InjectModel(Plan.name) private planModel: Model<Plan>) {}

  async createPlan(
    createPlanDto: PlanDto,
    res: Response,
  ): Promise<Plan | void> {
    const { name, billingCycle, features, description, price } = createPlanDto;

    try {
      const newPlan = new this.planModel({
        name,
        billingCycle,
        features,
        description,
        price,
        status: 'active',
      });
      const savedPlan = await newPlan.save();
      console.log('✅ Plan created successfully:', savedPlan);

      res.status(200).json({
        statusCode: 200,
        message: '✅ Plan created successfully.',
        success: true,
        data: savedPlan,
      });
    } catch (error) {
      console.error('❌ Error saving plan:', error);
      res.status(500).json({
        statusCode: 500,
        message: '❌ Something went wrong.',
        success: false,
      });
    }
  }

  async getActivePlan(res: Response): Promise<Plan[] | void> {
    try {
      const activePlan = await this.planModel.find({ status: 'active' });
      res.status(200).json({
        statusCode: 200,
        success: true,
        data: activePlan,
      });
    } catch (error) {
      console.error('❌ Failed to fetch active plans:', error);
      throw error;
      res.status(500).json({ 
        statusCode: 500, 
        message: '❌ Error fetching plans.', 
        success: false 
      });
    }
  }

  async updatePlan(updatePlanDto: UpdatePlanDto, res: Response) {
    try {
      const updatedPlans = await this.planModel.findByIdAndUpdate(
        updatePlanDto._id,
        { price: updatePlanDto.price, features: updatePlanDto.features },
        { new: true },
      );

      if (!updatedPlans) {
        return res.status(404).json({
          statusCode: 404,
          message: '❌ Plan not found.',
          success: false,
        });
      }

      res.status(200).json({
        statusCode: 200,
        message: '✅ Plan updated successfully.',
        success: true,
        data: updatedPlans,
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

  async deleteByIdPlan(id: string, res: Response) {
    try {
      const deletedPlan = await this.planModel.findByIdAndDelete(id);

      if (!deletedPlan) {
        return res.status(404).json({
          statusCode: 404,
          message: '❌ Plan not found.',
          success: false,
        });
      }

      res.status(200).json({
        statusCode: 200,
        message: '✅ Plan delete successfully.',
        success: true,
        data: deletedPlan,
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
