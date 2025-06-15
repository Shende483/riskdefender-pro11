import BaseService from '../../../../api-base/axios-base-service';

export interface Alert {
  _id: string;
  alertLimit: number;
  createdAt: string;
  paymentStatus: string;
}

export interface AlertResponse {
  length: number;
  statusCode: number;
  success: boolean;
  message: string;
  data: Alert[];
}

export default class AlertService extends BaseService {
  static async getAlertLimits() {
    return this.get<AlertResponse>('/alert/alert-limits');
  }
}