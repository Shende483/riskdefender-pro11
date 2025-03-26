import { PaymentType, SubscriptionType } from "../Types/SubscriptionTypes";
import BaseService from "./BaseService";

export default class SubscriptionService {

    public static setAccessToken(authData: { accessToken: string, appUser: string, userId: string }) {
        localStorage.setItem('appUser', JSON.stringify(authData.appUser));
        localStorage.setItem('accessToken', authData.accessToken);
        localStorage.setItem('userId', authData.userId);
    }

    public static getAppUser() {
        return JSON.parse(localStorage.getItem('appUser') as string);
    }

    public static getAccessToken() {
        return localStorage.getItem('accessToken');
    }

    public static getUserId() {
        return localStorage.getItem('userId');
    }

    static async CreateSubscription(subscriptionType: SubscriptionType) {
        return BaseService.post<{ message: string }>('subscription-details/subscribe', subscriptionType);
    }
    
    static async SubscriptionPayment(paymentType: PaymentType) {
        return BaseService.post<{ message: string }>('payment-details/payment', paymentType);
    }

}