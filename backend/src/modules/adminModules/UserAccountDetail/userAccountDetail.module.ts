import { Module } from '@nestjs/common';
import { MarketType, MarketTypeSchema } from '../MarketType/marketType.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import jwtConfing from 'src/config/jwt.confing';
import { UserAccountDetailsController } from './userAccountDetail.controller';
import { UserAccountDetails, UserAccountDetailsSchema } from './userAccountDetail.schema';
import { UserAccountDetailsService } from './userAccountDetail.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserAccountDetails.name, schema: UserAccountDetailsSchema }, // No change needed
      { name: MarketType.name, schema: MarketTypeSchema },
    ]),
    JwtModule.registerAsync(jwtConfing.asProvider()),
  ],
  controllers: [UserAccountDetailsController],
  providers: [UserAccountDetailsService],
})
export class UserAccountDetailModule {} // ✅ No modifications required