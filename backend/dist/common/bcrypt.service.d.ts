export declare class bcryptService {
    private static readonly SALT_ROUNDS;
    static hashData(data: string): Promise<string>;
    static compareData(data: string, hashedData: string): Promise<boolean>;
}
