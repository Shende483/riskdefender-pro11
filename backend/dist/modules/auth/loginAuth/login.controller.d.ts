import { LoginService } from './login.service';
import { LoginUserDto } from './dto/login.dto';
import { Response } from 'express';
export declare class LoginController {
    private loginService;
    constructor(loginService: LoginService);
    sendOtpEmail(email: string, res: Response): Promise<void>;
    sendOtpMobile(mobile: string, res: Response): Promise<void>;
    verifyOtpEmail(email: string, otp: string, res: Response): Promise<void>;
    verifyOtpMobile(mobile: string, otp: string, res: Response): Promise<void>;
    login(loginUserDto: LoginUserDto, res: Response): Promise<void>;
}
