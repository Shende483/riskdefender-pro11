import * as bcrypt from 'bcrypt';

export class bcryptService {
  private static readonly SALT_ROUNDS = 10;
  // Hash data (for passwords & API keys)
  static async hashData(data: string): Promise<string> {
    return bcrypt.hash(data, this.SALT_ROUNDS);
  }

  // Compare hashed data (for passwords & API keys)
  static async compareData(data: string, hashedData: string): Promise<boolean> {
    return bcrypt.compare(data, hashedData);
  }
}
