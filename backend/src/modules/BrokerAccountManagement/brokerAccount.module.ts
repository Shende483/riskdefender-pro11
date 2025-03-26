import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BrokerAccount, BrokerAccountSchema } from './brokerAcount.schema';
import { JwtModule } from '@nestjs/jwt';
import jwtConfing from 'src/config/jwt.confing';
import { BrokerAccountController } from './brokerAccount.controller';
import { BrokerAccountService } from './brokerAccount.service';
import {
  User,
  UserSchema,
} from 'src/modules/auth/updateUserInfoAuth/UserUpdateInfo.schema';
import {
  Subscription,
  SubscriptionSchema,
} from 'src/modules/SubcriptionDetails/subcription.schema';
import {
  Broker,
  BrokerSchema,
} from '../adminModules/BrokerManagment/broker.schema';
import {
  MarketType,
  MarketTypeSchema,
} from '../adminModules/MarketType/marketType.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BrokerAccount.name, schema: BrokerAccountSchema },
      { name: Broker.name, schema: BrokerSchema },
      { name: User.name, schema: UserSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: MarketType.name, schema: MarketTypeSchema },
    ]),
    JwtModule.registerAsync(jwtConfing.asProvider()),
  ],
  controllers: [BrokerAccountController],
  providers: [BrokerAccountService],
})
export class BrokerAccountModule {}
