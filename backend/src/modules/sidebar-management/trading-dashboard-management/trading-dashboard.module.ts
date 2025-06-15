import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BrokerAccount, BrokerAccountSchema } from './trading-dashboard.schema';
import { JwtModule } from '@nestjs/jwt';
import jwtConfing from 'src/config/jwt.confing';
import { BrokerAccountController } from './trading-dashboard.controller';
import { BrokerAccountService } from './trading-dashboard.service';
import {
  User,
  UserSchema,
} from 'src/modules/auth/updateUserInfoAuth/UserUpdateInfo.schema';

import {
  Broker,
  BrokerSchema,
} from '../../adminModules/BrokerManagment/broker.schema';
import {
  MarketType,
  MarketTypeSchema,
} from '../../adminModules/MarketType/marketType.schema';
import { SubbrokerPayment, SubbrokerPaymentSchema } from 'src/modules/payment-management/multiple-payment-schema/subbroker-payment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BrokerAccount.name, schema: BrokerAccountSchema },
      { name: Broker.name, schema: BrokerSchema },
      { name: User.name, schema: UserSchema },
      { name: MarketType.name, schema: MarketTypeSchema },
      { name: SubbrokerPayment.name, schema: SubbrokerPaymentSchema },
      
    ]),
    JwtModule.registerAsync(jwtConfing.asProvider()),
  ],
  controllers: [BrokerAccountController],
  providers: [BrokerAccountService],
})
export class BrokerAccountModule {}
