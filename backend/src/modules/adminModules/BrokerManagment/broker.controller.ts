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
} from '@nestjs/common';
import { CreateBrokerDto } from './dto/broker.dto';
import { BrokersService } from './broker.service';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UpdateBrokerDto } from './dto/updatebroker.dto';

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

  @Put('updateBroker')
  async updateBroker(
    @Body()
    updateBrokerDto: UpdateBrokerDto,
    @Res()
    res: Response,
  ) {
    console.log('🔹 Received UpdatePlanDto:', updateBrokerDto);

    if (!updateBrokerDto._id) {
      return res.status(400).json({
        statusCode: 400,
        message: '❌ Broker ID is required.',
        success: false,
      });
    }
    return this.brokerService.updateBroker(updateBrokerDto, res);
  }

  @Delete(':id/deleteBroker')
  async deleteBroker(@Param('id') id: string, @Res() response: Response) {
    await this.brokerService.deleteByIdBroker(id, response);
    return { message: 'Broker deleted successfully.' };
  }
}
