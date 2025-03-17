


import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const response: Response = context.switchToHttp().getResponse();

    const authHeader = request.headers.authorization;
    console.log("authheader", authHeader)

    if (!authHeader) {
      response.status(401).json({
        statusCode: 401,
        message: 'Authorization header missing',
        success: false,
      });
      return false;
    }

    const token = authHeader.split(' ')[1];
    console.log("token", token)
    if (!token) {
      response.status(401).json({
        statusCode: 401,
        message: 'Token not provided',
        success: false,
      });
      return false;
    }

    try {
      const decoded = this.jwtService.verifyAsync(token);
     console.log("decoded", decoded)
      return true;
    } catch (err) {
      response.status(401).json({
        statusCode: 401,
        message: 'Invalid or expired token',
        success: false,
      });
      return false;
    }
  }
}


