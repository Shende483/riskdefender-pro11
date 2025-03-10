import { LoginService } from './login.service';
import { LoginUserDto } from './dto/login.dto';
export declare class LoginController {
    private loginService;
    constructor(loginService: LoginService);
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
    login(loginUserDto: LoginUserDto): Promise<{
        message: string;
        access_token: string;
    }>;
}
