import Redis from 'ioredis';
export declare class OtpService {
    private readonly redisClient;
    constructor(redisClient: Redis);
    sendOtp(email: string, context: string): Promise<{
        message: string;
    }>;
    verifyOtp(email: string, enteredOtp: string): Promise<{
        message: string;
    }>;
    setVerifiedEmail(email: string): Promise<void>;
    isEmailVerified(email: string): Promise<boolean>;
    clearVerifiedEmail(email: string): Promise<void>;
}
