import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentDetailsController } from './payment.controller';
import { PaymentService } from './payment.service';
import {Payment, PaymentSchema} from './payment.schema';
import jwtConfing from 'src/config/jwt.confing';
import { JwtModule } from '@nestjs/jwt';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
    ]),

     JwtModule.registerAsync( jwtConfing.asProvider() ),
          
  ],
  controllers: [PaymentDetailsController],
  providers: [PaymentService],
})
export class recordPaymnetModule {}