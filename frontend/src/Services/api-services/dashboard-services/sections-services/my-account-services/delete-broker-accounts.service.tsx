import { ReactNode } from 'react';
import BaseService from '../../../../api-base/axios-base-service';

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
  pendingDeletion: boolean;
  deleteAt: string | null;
}

export interface SubBrokerResponse {
  length: number;
  statusCode: number;
  success: boolean;
  message: string;
  data: SubBrokerAccount[];
}

export interface OtpResponse {
  statusCode: number;
  success: boolean;
  message: string;
}

export default class DeleteBrokerAccountService extends BaseService {
  static async getActiveSubBrokerAccount() {
    return this.get<SubBrokerResponse>('/subBrokerAccount/delete-subbroker-accounts-list');
  }

  static async requestDeleteAccount(brokerAccountId: string) {
    return this.post<OtpResponse>('/cron-user-subaccounts/delete', { brokerAccountId });
  }

  static async cancelDeleteRequest(brokerAccountId: string) {
    return this.post<OtpResponse>('/cron-user-subaccounts/cancel-deletion', { brokerAccountId });
  }
}