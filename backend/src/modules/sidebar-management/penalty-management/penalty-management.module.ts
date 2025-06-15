import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { JwtModule } from '@nestjs/jwt';
import jwtConfing from 'src/config/jwt.confing';
import { PenaltyController } from './penalty-management.controller';
import { PenaltyPayment, PenaltyPaymentSchema } from '../../payment-management/multiple-payment-schema/penalty-payment.schema';
import { PenaltyService } from './penalty-management.service';



@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PenaltyPayment.name, schema: PenaltyPaymentSchema },
    ]),
     JwtModule.registerAsync(jwtConfing.asProvider()),
  ],
  controllers: [PenaltyController],
  providers: [PenaltyService],
})
export class PenaltyModule {}