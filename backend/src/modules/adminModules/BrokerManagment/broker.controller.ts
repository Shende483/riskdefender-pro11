import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CreateBrokerDto } from './dto/broker.dto';
import { BrokerResponse, BrokersService } from './broker.service';
import { Request, Response } from 'express';
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

  @Get('by-market-type')
  async getBrokersByMarketTypeId(
    @Query('marketTypeId') marketTypeId: string,
  ): Promise<BrokerResponse[]> {
    return this.brokerService.getBrokersByMarketTypeId(marketTypeId);
  }

  @Get('broker-details')
  @UseGuards(JwtAuthGuard)
  async getBrokerDetails(
    @Query('marketTypeId') marketTypeId: string,
    @Req() req: Request,
  ) {
    const { userId } = req['user'];

    if (!userId) {
      throw new BadRequestException('UserId is required');
    }

    const brokerDetails =
      await this.brokerService.getBrokerDetailsByUserIdAndMarketType(
        userId,
        marketTypeId,
      );

    return {
      statusCode: 200,
      message: 'Broker details retrieved successfully',
      success: true,
      data: brokerDetails,
    };
  }
}
