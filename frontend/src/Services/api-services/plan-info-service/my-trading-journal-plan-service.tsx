import BaseService from '../../api-base/axios-base-service';

export interface PlanType {
  _id: string;
  name: string;
  billingCycle: string;
  price: { INR: number; USD: number; EUR: number; GBP: number; AED: number; SGD: number; CAD: number; AUD: number };
  discountPercent: number;
  tradingJournalLimit: number;
  features: string[];
  description: string;
  gstRate: number;
  status: string;
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


export default class TradingJournalPlanService extends BaseService {
  static async getActivePlan() {
    return BaseService.get<PlanType[]>('trading-journal-plan/getPlan');
  }

  static async verifyCoupon(couponCode: string) {
    return BaseService.post<CouponResponse>('trading-journal-plan/coupon/verify',{code:couponCode }
    );
  }
}