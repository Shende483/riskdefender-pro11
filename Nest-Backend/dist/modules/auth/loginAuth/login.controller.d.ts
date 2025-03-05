import { LoginService } from './login.service';
import { LoginUserDto } from './dto/login.dto';
export declare class LoginController {
    private loginService;
    constructor(loginService: LoginService);
    sendOtp(email: string): Promise<{
        message: string;
    }>;
    verifyOtp(email: string, otp: string): Promise<{
        message: string;
    }>;
    login(loginUserDto: LoginUserDto): Promise<{
        message: string;
        access_token: string;
    }>;
}
