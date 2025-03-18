import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubscriptionDetailsController } from './subcription.controller';
import { SubscriptionDetailsService } from './subcription.service';
import {SubscriptionDetails, SubscriptionDetailsSchema} from './subcription.schema';
import jwtConfing from 'src/config/jwt.confing';
import { JwtModule } from '@nestjs/jwt';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SubscriptionDetails.name, schema: SubscriptionDetailsSchema },
    ]),

     JwtModule.registerAsync( jwtConfing.asProvider() ),
          
  ],
  controllers: [SubscriptionDetailsController],
  providers: [SubscriptionDetailsService],
})
export class SubscriptionDetailsModule {}