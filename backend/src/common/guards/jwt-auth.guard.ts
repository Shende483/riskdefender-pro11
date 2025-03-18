

import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    console.log("🟢 Received Token:", token); // Debug log to ensure token is received

    if (!token) {
      throw new UnauthorizedException('❌ Token is required');
    }

    try {
      const decoded = await this.jwtService.verifyAsync(token);

      if (!decoded) {
        throw new UnauthorizedException('❌ Invalid token payload');
      }

      console.log("✅ Decoded Token:", decoded); // Confirm token decoding success
      
      // Attach userId and email directly to the request object
      request['user'] = {
        userId: decoded.id,
        email: decoded.email
      };

      return true;
    } catch (error) {
      console.error("❌ Token Verification Error:", error.message); // Detailed error log
      throw new UnauthorizedException('❌ Invalid or expired token');
    }
  }
}


