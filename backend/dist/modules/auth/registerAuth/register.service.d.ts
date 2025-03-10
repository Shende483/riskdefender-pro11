import { Model } from 'mongoose';
import { User } from './register.schema';
import { CreateUserDto } from './dto/register.dto';
import { OtpService } from '../../../common/otp.service';
export declare class RegisterService {
    private userModel;
    private otpService;
    constructor(userModel: Model<User>, otpService: OtpService);
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
    createUser(createUserDto: CreateUserDto): Promise<User>;
    isEmailVerified(email: string): Promise<boolean>;
    isMobileVerified(mobile: string): Promise<boolean>;
    clearVerifiedEmail(email: string): Promise<void>;
    clearVerifiedMobile(mobile: string): Promise<void>;
    findUserByEmailOrMobile(emailOrMobile: string): Promise<User | null>;
    findUserByEmail(email: string): Promise<User | null>;
    findUserByMobile(mobile: string): Promise<User | null>;
    updateUserPassword(userId: string, newPassword: string): Promise<User | null>;
}
