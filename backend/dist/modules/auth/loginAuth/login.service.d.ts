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
    generateToken(user: any): Promise<string>;
    login(loginUserDto: LoginUserDto, res: Response): Promise<void>;
}
