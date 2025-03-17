import { RegisterService } from './register.service';
import { CreateUserDto } from './dto/register.dto';
import { Response } from 'express';
export declare class RegisterController {
    private RegisterService;
    constructor(RegisterService: RegisterService);
    sendOtpEmail(email: string, res: Response): Promise<void>;
    sendOtpMobile(mobileNo: string, res: Response): Promise<void>;
    verifyOtpEmail(email: string, otp: string, res: Response): Promise<void>;
    verifyOtpMobile(mobile: string, otp: string, res: Response): Promise<void>;
    createUser(createUserDto: CreateUserDto, res: Response): Promise<void | import("./register.schema").User>;
}
