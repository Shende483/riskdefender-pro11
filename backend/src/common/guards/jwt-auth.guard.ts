
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    //this real ip is work when appplication is live , anyone sen dreq using postman then we get device ip and ntwrk isp ip 
   // by using this we use rate liming concept 
  //  const realip=request.Ip
    const response = context.switchToHttp().getResponse();
    const token = request.headers.authorization?.split(' ')[1];

    console.log("🟢 Received Token:", token); // Debug log to ensure token is received

    if (!token) {
      response.status(200).json({
        statusCode: 301,
        message: '❌ Token is required, Please login First...',
        success: false
      });
      return false; // Ensure `false` is returned for proper guard handling
    }

    try {
      const decoded = await this.jwtService.verifyAsync(token);

      if (!decoded) {
        response.status(200).json({
          statusCode: 302,
          message: '❌ Invalid token payload',
          success: false
        });
        return false;
      }

      console.log("✅ Decoded Token:", decoded); // Confirm token decoding success
      request['user'] = {
        userId: decoded.id,
        email: decoded.email,
        mobile:decoded.mobile
      };

      return true;
    } catch (error) {
      console.error("❌ Token Verification Error:", error.message); // Detailed error log
      response.status(200).json({
        statusCode: 303,
        message: `❌ Token Verification Error:", ${error.message}`,
        success: false
      });
      return false;
    }
  }
}
