import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { PlanService } from './plan.service';
import { PlanDto } from './planDto/plan.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UpdatePlanDto } from './planDto/updateplan.dto';

@Controller('plan')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Post('createPlan')
  @UsePipes(new ValidationPipe())
  @UseGuards(JwtAuthGuard)
  async createPlan(@Body() planDto: PlanDto, @Res() res: Response) {
    await this.planService.createPlan(planDto, res);
    return { message: 'Plan created successfully.' };
  }

  @Get('getPlan')
  @UseGuards(JwtAuthGuard)
  async getActivePlan(@Res() res: Response) {
    console.log('getPlan');
    return this.planService.getActivePlan(res);
  }

  @Put('updatePlan')
  async updatePlan(
    @Body()
    updatePlanDto: UpdatePlanDto,
    @Res()
    res: Response,
  ) {
    console.log('🔹 Received UpdatePlanDto:', updatePlanDto);

    if (!updatePlanDto._id) {
      return res.status(400).json({
        statusCode: 400,
        message: '❌ Plan ID is required.',
        success: false,
      });
    }
    return this.planService.updatePlan(updatePlanDto, res);
  }

  @Delete(':id/deleteplan')
  async deletePlan(@Param('id') id: string, @Res() res: Response) {
    return this.planService.deleteByIdPlan(id, res);
  }
}
