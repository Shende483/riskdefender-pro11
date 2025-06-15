import BaseService from '../../api-base/axios-base-service';

export interface PlanType {
  _id: string;
  name: string;
  price: { INR: number; USD: number; EUR: number; GBP: number; AED: number; SGD: number; CAD: number; AUD: number };
  discountPercent: number;
  description: string;
  gstRate: number;
  status: string;
}

export interface CouponResponse {
  statusCode: number;
  success: boolean;
  discountPercentage: number;
  message: string;
}

export default class PenaltyPlanService extends BaseService {
  static async GetPlanByType(planType: string) {
    return BaseService.post<PlanType[]>('penalty-plan/getPlanByType', { planType });
  }

  static async VerifyCoupon(couponCode: string) {
    return BaseService.post<CouponResponse>('penalty-plan/coupon/verify', { code: couponCode });
  }
}