
import BaseService from '../../../../api-base/axios-base-service';

export interface BrokerAccount {
  _id: string;
  brokerName: string;
  brokerId: string;
  subBrokerId?: string;
  subBrokerName?: string;
  tradingRuleData?: {
    cash: TradingRule[];
    option: TradingRule[];
    future: TradingRule[];
  };
}

export interface TradingRule {
  key: string;
  value: string | object;
}

export interface TradingType {
  id: string;
  name: string;
}

export interface PlanDetails {
  endDate: string;
  daysLeft: number;
  hoursLeft: number;
  planExpiryMessage?: string;
  deletionMessage?: string;
  extraDaysMessage?: string;
}

export default class BrokerService extends BaseService {
  static async getBrokerDetails(params: { marketTypeId: string }) {
    return this.get<BrokerAccount[]>('/brokerAccount/broker-details', { params });
  }

  static async getSubBrokerDetails(data: { marketTypeId: string; brokerId: string }) {
    return this.post<BrokerAccount[]>('/brokerAccount/sub-broker-details', data);
  }

  static async getTradingRules(data: { subBrokerId: string; tradingType: string }) {
    return this.post<{
      data: {
        subBrokerId: string;
        subBrokerName: string;
        tradingType: string;
        tradingRules: TradingRule[];
        planDetails?: PlanDetails;
      }
    }>('/brokerAccount/trading-rules', data);
  }
}
/*
import BaseService from '../../../../api-base/axios-base-service';

export interface BrokerAccount {
  _id: string;
  brokerName: string;
  brokerId: string;
  subBrokerId?: string;
  subBrokerName?: string;
  tradingRuleData?: {
    cash: TradingRule[];
    option: TradingRule[];
    future: TradingRule[];
  };
}

export interface TradingRule {
  key: string;
  value: string | object;
}

export interface TradingType {
  id: string;
  name: string;
}

export default class BrokerService extends BaseService {
  static async getBrokerDetails(params: { marketTypeId: string }) {
    return this.get<BrokerAccount[]>('/brokerAccount/broker-details', { params });
  }

  static async getSubBrokerDetails(data: { marketTypeId: string; brokerId: string }) {
    return this.post<BrokerAccount[]>('/brokerAccount/sub-broker-details', data);
  }

  static async getTradingRules(data: { subBrokerId: string; tradingType: string }) {
    return this.post<{ data: { subBrokerId: string; subBrokerName: string; tradingType: string; tradingRules: TradingRule[] } }>('/brokerAccount/trading-rules', data);
  }
}
*/