import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubscriptionDetailsController } from './subcription.controller';
import { SubscriptionDetailsService } from './subcription.service';
import {SubscriptionDetails, SubscriptionDetailsSchema} from './subcription.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SubscriptionDetails.name, schema: SubscriptionDetailsSchema },
    ]),
  ],
  controllers: [SubscriptionDetailsController],
  providers: [SubscriptionDetailsService],
})
export class SubscriptionDetailsModule {}