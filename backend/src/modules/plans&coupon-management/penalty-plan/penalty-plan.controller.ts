import {
  Body,
  Controller,
  Post,
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { Response } from 'express';
import { PenaltyPlanService } from './penalty-plan.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CouponDto } from '../common-coupon-plan/coupon-dto';
import { PenaltyPlanDto } from './penalty-plan.dto';
import { ValidationPipe } from '@nestjs/common';

@Controller('penalty-plan')
export class PenaltyPlanController {
  constructor(private readonly planService: PenaltyPlanService) {}

  @Post('coupon/verify')
  @UseGuards(JwtAuthGuard)
  async verifyCoupon(@Body() couponDto: CouponDto, @Res() res: Response) {
    console.log('FGFGFFFFF', couponDto);
    return this.planService.verifyCoupon(couponDto.code, res);
  }

  @Post('getPlanByType')
  @UseGuards(JwtAuthGuard)
  async getPlansByType(@Body() penaltyPlanDto: PenaltyPlanDto, @Res() res: Response) {
    console.log('Fetching plans by type:', penaltyPlanDto.planType);
    return this.planService.getPlansByType(penaltyPlanDto.planType, res);
  }
  
}