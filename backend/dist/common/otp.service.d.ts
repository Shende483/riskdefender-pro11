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
    }>;
    verifyOtpEmail(email: string, enteredOtp: string): Promise<{
        message: string;
    }>;
    isEmailVerified(email: string): Promise<boolean>;
    clearVerifiedEmail(email: string): Promise<void>;
    sendOtpMobile(mobile: string, context: string): Promise<{
        message: string;
    }>;
    verifyOtpMobile(mobile: string, enteredOtp: string): Promise<{
        message: string;
    }>;
    setVerifiedMobile(mobile: string): Promise<void>;
    isMobileVerified(mobile: string): Promise<boolean>;
    clearVerifiedMobile(mobile: string): Promise<void>;
}
