import { Model } from 'mongoose';
import { User } from './register.schema';
import { CreateUserDto } from './dto/register.dto';
import { OtpService } from '../../../common/otp.service';
import { Response } from 'express';
export declare class RegisterService {
    private userModel;
    private otpService;
    constructor(userModel: Model<User>, otpService: OtpService);
    sendOtpEmail(email: string, res: Response): Promise<Response<any, Record<string, any>>>;
    sendOtpMobile(mobile: string, res: Response): Promise<Response<any, Record<string, any>>>;
    verifyOtpEmail(email: string, otp: string, res: Response): Promise<void>;
    verifyOtpMobile(mobile: string, otp: string, res: Response): Promise<void>;
    createUser(createUserDto: CreateUserDto, res: Response): Promise<User | void>;
    isEmailVerified(email: string): Promise<boolean>;
    isMobileVerified(mobile: string): Promise<boolean>;
    clearVerifiedEmail(email: string): Promise<void>;
    clearVerifiedMobile(mobile: string): Promise<void>;
    findUserByEmailOrMobile(emailOrMobile: string): Promise<User | null>;
    findUserByEmail(email: string): Promise<User | null>;
    findUserByMobile(mobile: string): Promise<User | null>;
    updateUserPassword(userId: string, newPassword: string): Promise<User | null>;
}
