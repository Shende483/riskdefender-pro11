import { PlanType } from "../Types/SubscriptionTypes";
import BaseService from "./BaseService";

export default class PlanService {
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

    static async GetPlan() {
        return BaseService.get<PlanType[]>('plan/getPlan');
    }

}