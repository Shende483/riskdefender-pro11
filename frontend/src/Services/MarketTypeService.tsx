import BaseService from './BaseService';

import type { MarketTypeList, MarketTypeDetails } from '../Types/MarketTypes';

export default class MarketTypeService extends BaseService {
  static async createMarketType(marketTypeDetails: MarketTypeDetails) {
    return this.post<{ message: string }>('Admin/market-type/create', marketTypeDetails);
  }

  static async getAllActiveMarketTypes() {
    return this.get<MarketTypeList[]>('Admin/market-type/getAll');
  }
}
