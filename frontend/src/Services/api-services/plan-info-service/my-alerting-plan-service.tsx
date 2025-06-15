import BaseService from "../../api-base/axios-base-service";


export interface PlanType {
  _id: string;
  name: string;
  price: { INR: number; USD: number; EUR: number; GBP: number; AED: number; SGD: number; CAD: number; AUD: number };
  billingCycle: string;
  alertLimit: number;
  description: string;
  features: string[];
  gstRate: number;
  discountPercent: number;
  createdDate: string;
  modifiedDate: string;
  __v: number;
}

 export interface CouponResponse {
  statusCode: number;
  success: boolean;
  discountPercentage: number;
  message: string;
}

export default class AlertPlanService extends BaseService {

  static async getActivePlan() {
    return BaseService.get<PlanType[]>('alert-plan/getPlan');
  }

  static async verifyCoupon(couponCode: string) {
    return BaseService.post<CouponResponse>('alert-plan/coupon/verify', { code:couponCode });
  }
}

