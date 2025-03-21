import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Plan, PlanDetailsSchema } from './plan.schema';
import { PlanController } from './plan.controller';
import { PlanService } from './plan.service';
import { JwtModule } from '@nestjs/jwt';
import jwtConfing from 'src/config/jwt.confing';


@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Plan.name, schema: PlanDetailsSchema },
        ]),
        JwtModule.registerAsync(jwtConfing.asProvider()),
    ],
    controllers: [PlanController],
    providers: [PlanService],
})
export class PlanModule { }