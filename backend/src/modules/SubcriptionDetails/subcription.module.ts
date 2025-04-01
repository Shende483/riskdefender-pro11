import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubscriptionDetailsController } from '../SubcriptionDetails/subcription.controller';
import { SubscriptionService } from '../SubcriptionDetails/subcription.service';
import {
  Subscription,
  SubscriptionSchema,
} from './subcription.schema';
import jwtConfing from 'src/config/jwt.confing';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Subscription.name, schema: SubscriptionSchema },
    ]),

    JwtModule.registerAsync(jwtConfing.asProvider()),
  ],
  controllers: [SubscriptionDetailsController],
  providers: [SubscriptionService],
})
export class SubscriptionDetailsModule {}
