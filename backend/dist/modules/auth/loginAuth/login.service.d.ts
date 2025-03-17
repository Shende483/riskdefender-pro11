import { RegisterService } from '../registerAuth/register.service';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login.dto';
import { OtpService } from '../../../common/otp.service';
import { Response } from 'express';
export declare class LoginService {
    private usersService;
    private jwtService;
    private otpService;
    constructor(usersService: RegisterService, jwtService: JwtService, otpService: OtpService);
    sendOtpEmail(email: string, res: Response): Promise<void>;
    sendOtpMobile(mobile: string, res: Response): Promise<void>;
    verifyOtpEmail(email: string, otp: string, res: Response): Promise<void>;
    verifyOtpMobile(mobile: string, otp: string, res: Response): Promise<void>;
    login(loginUserDto: LoginUserDto, res: Response): Promise<void>;
    isEmailVerified(email: string): Promise<boolean>;
    isMobileVerified(mobile: string): Promise<boolean>;
    clearVerifiedEmail(email: string): Promise<void>;
    clearVerifiedMobile(mobile: string): Promise<void>;
}
