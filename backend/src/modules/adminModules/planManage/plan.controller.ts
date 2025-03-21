import {
    Body,
    Controller,
    Get,
    Post,
    Res,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { PlanService } from './plan.service';
import { PlanDto } from './planDto/plan.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('plan')
export class PlanController {
    constructor(private readonly planService: PlanService) { }

    @Post('createPlan')
    @UsePipes(new ValidationPipe())
    @UseGuards(JwtAuthGuard)
    async createPlan(
        @Body() planDto: PlanDto,
        @Res() res: Response,
    ) {
        await this.planService.createPlan(planDto, res);
        return { message: 'Plan created successfully.' };
    }

    @Get('getPlan')
    @UseGuards(JwtAuthGuard)
    async getActivePlan() {
        return this.planService.getActivePlan();
    }
}
