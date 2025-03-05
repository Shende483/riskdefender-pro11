

// src/module/users/users.controller.ts
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { RegisterService } from './register.service';
import { CreateUserDto } from './dto/register.dto';

@Controller('auth')
export class UsersController {
  constructor(private usersService: RegisterService) {}



  @Post('register')
  async createUser(@Body() createUserDto: CreateUserDto) {
       console.log(`📩 Received signup request:`, createUserDto); // ✅ Log incoming request data
    return this.usersService.createUser(createUserDto);
  }
}



