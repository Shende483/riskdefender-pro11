import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserExitAccount, UserExitAccountSchema } from './userTrading.schema';
import { UserExitAccountService } from './userTrading.service';
import { UserExitAccountController } from './userTrading.controller';
import jwtConfing from 'src/config/jwt.confing';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: UserExitAccount.name,
        schema: UserExitAccountSchema,
      },
    ]),
    JwtModule.registerAsync(jwtConfing.asProvider()),
  ],
  controllers: [UserExitAccountController],
  providers: [UserExitAccountService],
  exports: [UserExitAccountService],
})
export class UserExitAccountModule {}
