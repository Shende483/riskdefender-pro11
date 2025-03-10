import { RegisterService } from './register.service';
import { CreateUserDto } from './dto/register.dto';
export declare class RegisterController {
    private RegisterService;
    constructor(RegisterService: RegisterService);
    sendOtpEmail(email: string): Promise<{
        message: string;
    }>;
    sendOtpMobile(mobileNo: string): Promise<{
        message: string;
    }>;
    verifyOtpEmail(email: string, otp: string): Promise<{
        message: string;
    }>;
    verifyOtpMobile(mobile: string, otp: string): Promise<{
        message: string;
    }>;
    createUser(createUserDto: CreateUserDto): Promise<import("./register.schema").User>;
}
