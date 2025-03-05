import { RegisterService } from '../registerAuth/register.service';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login.dto';
import { OtpService } from '../../../common/otp.service';
export declare class LoginService {
    private usersService;
    private jwtService;
    private otpService;
    constructor(usersService: RegisterService, jwtService: JwtService, otpService: OtpService);
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
    isEmailVerified(email: string): Promise<boolean>;
    clearVerifiedEmail(email: string): Promise<void>;
}
