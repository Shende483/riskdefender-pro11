import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PenaltyPlan, PenaltyPlanDetailsSchema } from './penalty-plan.schema';

import { PenaltyPlanController } from './penalty-plan.controller';
import { PenaltyPlanService} from './penalty-plan.service';
import { JwtModule } from '@nestjs/jwt';
import jwtConfing from 'src/config/jwt.confing';
import { Coupon, CouponSchema } from '../common-coupon-plan/coupon-schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PenaltyPlan.name, schema: PenaltyPlanDetailsSchema },
      { name: Coupon.name, schema: CouponSchema },
    ]),
    JwtModule.registerAsync(jwtConfing.asProvider()),
  ],
  controllers: [PenaltyPlanController],
  providers: [PenaltyPlanService],
})
export class PenaltyPlanModule {}