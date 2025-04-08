import { Module } from '@nestjs/common';
import { MarketType, MarketTypeSchema } from '../MarketType/marketType.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import jwtConfing from 'src/config/jwt.confing';
import { UserTradingExistingData, UserTradingExistingSchema } from './userTradingExistingData.schema';
import { UserTradingExistingController } from './userTradingExistingData.controller';
import { UserTradingExistingService } from './userTradingExistingData.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserTradingExistingData.name, schema: UserTradingExistingSchema }, // No change needed
      { name: MarketType.name, schema: MarketTypeSchema },
    ]),
    JwtModule.registerAsync(jwtConfing.asProvider()),
  ],
  controllers: [UserTradingExistingController],
  providers: [UserTradingExistingService],
})
export class UserTradingExistingModule {} // ✅ No modifications required