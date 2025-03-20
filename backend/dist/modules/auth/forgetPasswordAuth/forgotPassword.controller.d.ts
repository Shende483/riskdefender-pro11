import { ForgetPasswordService } from './forgetPassword.service';
import { ForgetPasswordUserDto } from './dto/forgetPassword.dto';
export declare class ForgetPasswordController {
    private forgetPasswordService;
    constructor(forgetPasswordService: ForgetPasswordService);
    sendOtpEmail(email: string): Promise<{
        message: string;
        statuscode: number;
        success: boolean;
        error?: undefined;
    } | {
        message: string;
        error: any;
        statuscode: number;
        success: boolean;
    }>;
    sendOtpMobile(mobile: string): Promise<{
        message: string;
        statuscode: number;
        success: boolean;
        error?: undefined;
    } | {
        message: string;
        error: any;
        statuscode: number;
        success: boolean;
    }>;
    verifyOtpEmail(email: string, otp: string): Promise<{
        message: string;
        statuscode: number;
        success: boolean;
    }>;
    verifyOtpMobile(mobile: string, otp: string): Promise<{
        message: string;
        statuscode: number;
        success: boolean;
    }>;
    resetPassword(forgetPasswordUserData: ForgetPasswordUserDto): Promise<{
        message: string;
    }>;
}
