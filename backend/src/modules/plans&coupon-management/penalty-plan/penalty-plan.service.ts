import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Response } from 'express';
import { PenaltyPlan, PenaltyPlanDocument } from './penalty-plan.schema';
import { Coupon, CouponDocument } from '../common-coupon-plan/coupon-schema';

@Injectable()
export class PenaltyPlanService {
  constructor(
    @InjectModel(PenaltyPlan.name) private planModel: Model<PenaltyPlanDocument>,
    @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
  ) {}

  async verifyCoupon(couponCode: string, res: Response) {
    try {
      const coupon = await this.couponModel.findOne({ code: couponCode, status: 'active' }).exec();
      if (!coupon) {
        return res.status(200).json({
          statusCode: 304,
          success: false,
          discountPercentage: 0,
          message: 'Invalid or Expired coupon code',
        });
      }
      return res.status(200).json({
        statusCode: 200,
        success: true,
        discountPercentage: coupon.discountPercentage,
        message: 'Coupon applied successfully',
      });
    } catch (error) {
      return res.status(200).json({
        statusCode: 303,
        success: false,
        discountPercentage: 0,
        message: 'Invalid Or Expired Coupon Entered',
      });
    }
  }

  async getPlansByType(planType: string, res: Response) {
    try {
      let planNames: string[];
      switch (planType) {
        case 'updatePenalty':
          planNames = ['UpdateRulePenalty'];
          break;
        case 'trailingPenalty':
          planNames = ['SL&TargetTrailPenalty'];
          break;
        case 'closePositionPenalty':
          planNames = ['ClosePositionPenalty'];
          break;
        default:
          return res.status(200).json({
            statusCode: 400,
            message: 'Invalid plan type',
            success: false,
          });
      }

      const plans = await this.planModel
        .find({
          name: { $in: planNames },
          status: 'active',
        })
        .lean()
        .exec();

      if (!plans || plans.length === 0) {
        return res.status(200).json({
          statusCode: 404,
          message: 'No active plans found for the specified type',
          success: false,
        });
      }
console.log('Plans retrieved successfully:', plans);
      return res.status(200).json({
        statusCode: 200,
        message: 'Plans retrieved successfully',
        success: true,
        data: plans,
      });
    } catch (error) {
      console.error('❌ Error retrieving plans by type:', error);
      return res.status(200).json({
        statusCode: 500,
        message: 'Error retrieving plans',
        success: false,
        error: error.message,
      });
    }
  }
}