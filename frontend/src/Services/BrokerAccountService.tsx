// BrokerAccountService.ts
import BaseService, {API_BASE_URL } from './BaseService';

import type { BrokerAccountPayload, BrokerAccountResponse, Plan } from '../Types/BrokerAccountTypes';

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  success: boolean;
  data: T;
}

export interface Broker {
  _id: string;
  name: string;
}

class BrokerAccountService extends BaseService {
  static API_BASE_URL: any;

  static async createBrokerAccount(payload: BrokerAccountPayload): Promise<BrokerAccountResponse> {
    return this.post<BrokerAccountResponse>('brokerAcc/createBrokerAcc', payload);
  }

  // static async getBrokersByMarketTypeId(marketTypeId: string): Promise<Broker[]> {
  //   const response = await this.get<Broker[]>(
  //     `broker/by-market-type?marketTypeId=${marketTypeId}`
  //   );
  //   return response.data;
  // }

  static async getUserSubscriptionPlans() {
      return this.get<Plan[]>('subscription-details/get-user-subscriptions');
    }
}

export default BrokerAccountService;
