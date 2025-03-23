import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CreateBrokerDto } from './dto/broker.dto';
import { BrokersService } from './broker.service';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('broker')
export class BrokerController {
  constructor(private readonly brokerService: BrokersService) {}

  @Post('createBroker')
  @UseGuards(JwtAuthGuard)
  async createBroker(
    @Body() createBrokerDto: CreateBrokerDto,
    @Res() res: Response,
  ) {
    await this.brokerService.createBroker(createBrokerDto, res);
    return { message: 'Broker created successfully.' };
  }

  @Get('getBroker')
  @UseGuards(JwtAuthGuard)
  async getActiveBrokers() {
    return this.brokerService.getActiveBrokers();
  }
}
