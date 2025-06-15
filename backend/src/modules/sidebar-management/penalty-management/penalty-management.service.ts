import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PenaltyPayment, PenaltyPaymentDocument } from '../../payment-management/multiple-payment-schema/penalty-payment.schema';

@Injectable()
export class PenaltyService {
  constructor(
    @InjectModel(PenaltyPayment.name)
    private readonly penaltyPaymentModel: Model<PenaltyPaymentDocument>,
  ) {}

  async getPenaltyPlan(userId: string) {
    try {
      console.log('Fetching penalty details for user:', userId);

      if (!Types.ObjectId.isValid(userId)) {
        return {
          statusCode: 400,
          message: 'Invalid user ID',
          success: false,
          data: [],
        };
      }

      const penalties = await this.penaltyPaymentModel
        .find({ userId: new Types.ObjectId(userId) })
        .exec();

      if (!penalties || penalties.length === 0) {
        return {
          statusCode: 200,
          message: 'No penalty data found for user',
          success: false,
          data: [],
        };
      }

      const formattedPenalties = penalties.map((penalty) => {
        const plainPenalty = penalty.toObject();
        return {
          _id: plainPenalty._id.toString(),
          penaltyPlanId: plainPenalty.penaltyPlanId.toString(),
        
            
        };
      });

      return {
        statusCode: 200,
        message: formattedPenalties.length > 0 ? 'Penalty data retrieved successfully' : 'No penalty data found',
        success: formattedPenalties.length > 0,
        data: formattedPenalties,
      };
    } catch (error) {
      console.error('Error fetching penalty data:', error);
      return {
        statusCode: 500,
        message: 'Error fetching penalty data',
        success: false,
        data: [],
      };
    }
  }
}