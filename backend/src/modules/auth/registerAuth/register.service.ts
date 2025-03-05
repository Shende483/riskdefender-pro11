

// src/module/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './register.schema';
import { CreateUserDto } from './dto/register.dto';
import { OtpService } from '../../../common/otp.service';

@Injectable()
export class RegisterService {
  constructor(@InjectModel(User.name) private userModel: Model<User>
) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const newUser = new this.userModel(createUserDto);
    return newUser.save();
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }
}
