import BaseService from '../../api-base/axios-base-service';







export interface PlanType {
  _id: string;
  name: string;
  price: {
    INR: number;
    USD: number;
    EUR: number;
    GBP: number;
    AED: number;
    SGD: number;
    CAD: number;
    AUD: number;
  };
  duration: string;
  durationInMonths: number;
  description: string;
  features: string[];
  gstRate: number;
  discountPercent: number;
  createdDate: string;
  modifiedDate: string;
  __v: number;
  currency: string;
}



export interface CouponResponse {
  statusCode: number;
  success: boolean;
  discountPercentage: number;
  message: string;
}

export default class BrokerPlanService extends BaseService {
  static async GetPlan() {
    return BaseService.get<PlanType[]>('subbroker-plan/getPlan');
  }

  static async VerifyCoupon(couponCode: string) {
    return BaseService.post<CouponResponse>('subbroker-plan/coupon/verify', {code: couponCode});
  }
}