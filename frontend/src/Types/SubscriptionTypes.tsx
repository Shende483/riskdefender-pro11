export interface SubscriptionType {
  planId: string;
  planName: string;
  numberOfBroker: number;
  startDate: Date;
  endDate: string;
  status: string;
}

export interface SubscriptionUpdateType {
  status: string;
}

export interface PaymentType {
  subscriptionId: string;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  status: string;
}

export interface PlanType {
  _id: string;
  planName: string;
  price: number;
  billingCycle: string;
  features: string[];
  status: string;
}
