import { LoginUserDto } from '../Types/AuthTypes';
import BaseService from './BaseService';


export default class AuthService {
  public static setAccessToken(authData: { accessToken: string; appUser: string; userId: string }) {
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

  static async sendOtpEmail(email: string) {
    return BaseService.post<{ message: string }>('auth/login/verify-email', { email });
  }

  static async sendOtpMobile(mobile: string) {
    return BaseService.post<{ message: string }>('auth/login/verify-mobile', { mobile });
  }

  static async verifyOtpEmail(email: string, otp: string) {
    return BaseService.post<{ message: string }>('auth/login/verify-otp-email', { email, otp });
  }

  static async verifyOtpMobile(mobile: string, otp: string) {
    return BaseService.post<{ message: string }>('auth/login/verify-otp-mobile', { mobile, otp });
  }

  static async login(loginUserDto: LoginUserDto) {
    const response = await BaseService.post<{ accessToken: string; appUser: string; userId: string }>(
      'auth/login',
      loginUserDto,
    );
    this.setAccessToken(response); // Save access token to localStorage
    return response;
  }

  static logout() {
    localStorage.clear();
    return true;
  }
}