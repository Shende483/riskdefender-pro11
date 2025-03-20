import Redis from 'ioredis';
export declare class OtpService {
    private readonly redisClient;
    constructor(redisClient: Redis);
    private generateOtp;
    private storeOtp;
    private verifyStoredOtp;
    private setVerified;
    setVerifiedEmail(email: string): Promise<void>;
    private isVerified;
    private clearVerified;
    sendOtpEmail(email: string, context: string): Promise<{
        message: string;
        statuscode: number;
        success: boolean;
        error?: undefined;
    } | {
        message: string;
        error: any;
        statuscode: number;
        success: boolean;
    }>;
    verifyOtpEmail(email: string, enteredOtp: string): Promise<{
        message: string;
        statuscode: number;
        success: boolean;
    }>;
    isEmailVerified(email: string): Promise<boolean>;
    clearVerifiedEmail(email: string): Promise<void>;
    sendOtpMobile(mobile: string, context: string): Promise<{
        message: string;
        statuscode: number;
        success: boolean;
        error?: undefined;
    } | {
        message: string;
        error: any;
        statuscode: number;
        success: boolean;
    }>;
    verifyOtpMobile(mobile: string, enteredOtp: string): Promise<{
        message: string;
        statuscode: number;
        success: boolean;
    }>;
    setVerifiedMobile(mobile: string): Promise<void>;
    isMobileVerified(mobile: string): Promise<boolean>;
    clearVerifiedMobile(mobile: string): Promise<void>;
}
