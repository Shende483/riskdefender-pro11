import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubscriptionDetailsController } from './subcription.controller';
import { SubscriptionService } from '../subcriptionDetails/subcription.service';
import {Subscription, SubscriptionSchema} from '../subcriptionDetails/subcription.schema';
import jwtConfing from 'src/config/jwt.confing';
import { JwtModule } from '@nestjs/jwt';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Subscription.name, schema: SubscriptionSchema },
    ]),

     JwtModule.registerAsync( jwtConfing.asProvider() ),
          
  ],
  controllers: [SubscriptionDetailsController],
  providers: [SubscriptionService],
})
export class SubscriptionDetailsModule {}