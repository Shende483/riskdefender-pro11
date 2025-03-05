

// src/module/users/users.module.ts
import { Module } from '@nestjs/common';
import { RegisterService } from './register.service';
import { UsersController } from './register.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './register.schema';
import { RedisModule } from 'src/common/redis.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    RedisModule,

],
  controllers: [UsersController],
  providers: [RegisterService],
  exports: [RegisterService],
})
export class RegisterModule {}
