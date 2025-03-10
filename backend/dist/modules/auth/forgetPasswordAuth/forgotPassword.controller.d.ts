import { ForgetPasswordService } from './forgetPassword.service';
import { ForgetPasswordUserDto } from './dto/forgetPassword.dto';
export declare class ForgetPasswordController {
    private forgetPasswordService;
    constructor(forgetPasswordService: ForgetPasswordService);
    sendOtpEmail(email: string): Promise<{
        message: string;
    }>;
    sendOtpMobile(mobile: string): Promise<{
        message: string;
    }>;
    verifyOtpEmail(email: string, otp: string): Promise<{
        message: string;
    }>;
    verifyOtpMobile(mobile: string, otp: string): Promise<{
        message: string;
    }>;
    resetPassword(forgetPasswordUserData: ForgetPasswordUserDto): Promise<{
        message: string;
    }>;
}
