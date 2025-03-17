import { RegisterService } from '../registerAuth/register.service';
import { ForgetPasswordUserDto } from './dto/forgetPassword.dto';
import { OtpService } from '../../../common/otp.service';
export declare class ForgetPasswordService {
    private usersService;
    private otpService;
    constructor(usersService: RegisterService, otpService: OtpService);
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
    resetPassword(forgetPasswordUserDto: ForgetPasswordUserDto): Promise<{
        message: string;
    }>;
    isEmailVerified(email: string): Promise<boolean>;
    isMobileVerified(mobile: string): Promise<boolean>;
    clearVerifiedEmail(email: string): Promise<void>;
    clearVerifiedMobile(mobile: string): Promise<void>;
}
