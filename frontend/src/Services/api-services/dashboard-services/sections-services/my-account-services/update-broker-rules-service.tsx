import { ReactNode } from 'react';
import BaseService from '../../../../api-base/axios-base-service';
import { TradingRules, TradingRulesResponse } from './add-broker-rules-service';

export interface SubBrokerAccount {
  _id: string;
  marketTypeId: string;
  brokerId: string;
  brokerName: ReactNode;
  brokerKey: string;
  subAccountName: string;
  startDate: string;
  endDate: string;
  proxyServiceId: string;
  status: string;
  pendingUpdate: boolean;
  updateStart: string | null;
  updateEnd: string | null;
}

export interface SubBrokerResponse {
  length: number;
  statusCode: number;
  success: boolean;
  message: string;
  data: SubBrokerAccount[];
}

export interface UpdateResponse {
  statusCode: number;
  success: boolean;
  message: string;
}

export default class UpdateTradingRulesService extends BaseService {
  static async getActiveSubBrokerAccount() {
    return this.get<SubBrokerResponse>('/subBrokerAccount/update-subbroker-accounts-list');
  }

  static async requestUpdate(brokerAccountId: string) {
    return this.post<UpdateResponse>('/trading-rules/update', { brokerAccountId });
  }

  static async cancelUpdate(brokerAccountId: string) {
    return this.post<UpdateResponse>('/trading-rules/cancel-update', { brokerAccountId });
  }

   static async setTradingRules(body: { 
    _id:string;
    noRulesChange:boolean;
    tradingRuleData: TradingRules 
  }) {
    return this.post<TradingRulesResponse>('/subBrokerAccount/update-trading-rules', body);
  }

}