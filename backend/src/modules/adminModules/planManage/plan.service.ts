import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Response } from 'express';
import { Plan } from './plan.schema';
import { PlanDto } from './planDto/plan.dto';

@Injectable()
export class PlanService {
    constructor(
        @InjectModel(Plan.name) private planModel: Model<Plan>,
    ) { }

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
                message: '❌ Something went wrong. Plan not saved.',
                success: false,
            });
        }
    }



    async getActivePlan(res: Response): Promise<Plan[] | void> {
        try {
            const activePlan = await this.planModel.find({ status: 'active' });
            console.log('🔍 Fetching active plans...', activePlan);
            res.status(200).json({
                statusCode: 200,
                message: '✅ Plan created successfully.',
                success: true,
                data: activePlan,

            }
            )
        } catch (error) {
            console.error('❌ Error fetching active plans:', error);
            throw error;
        }
    }

}
