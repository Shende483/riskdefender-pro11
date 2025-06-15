import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AlertManagement, AlertManagementDocument } from './alert-management.schema';


@Injectable()
export class AlertService {
  constructor(
    @InjectModel(AlertManagement.name)
    private readonly alertManagementModel: Model<AlertManagementDocument>,
  ) {}

  async getAlertLimits(userId: string) {
    try {
      console.log('Fetching alert limits for user:', userId);

      if (!Types.ObjectId.isValid(userId)) {
        return {
          statusCode: 400,
          message: 'Invalid user ID',
          success: false,
          data: [],
        };
      }

      const alerts = await this.alertManagementModel
        .find({ userId: new Types.ObjectId(userId) })
        .exec();

      if (!alerts || alerts.length === 0) {
        return {
          statusCode: 200,
          message: 'No alert data found for user',
          success: false,
          data: [],
        };
      }

      const formattedAlerts = alerts.map((alert) => {
        const plainAlert = alert.toObject();
        return {
          _id: plainAlert._id.toString(),
          alertLimit: plainAlert.myAlertLimit,
    
        };
      });

      return {
        statusCode: 200,
        message: formattedAlerts.length > 0 ? 'Alert data retrieved successfully' : 'No alert data found',
        success: formattedAlerts.length > 0,
        data: formattedAlerts,
      };
    } catch (error) {
      console.error('Error fetching alert data:', error);
      return {
        statusCode: 500,
        message: 'Error fetching alert data',
        success: false,
        data: [],
      };
    }
  }
}