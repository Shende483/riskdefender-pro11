import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { BrokerAccountDto } from './dto/brokerAccount.dto';
import { Response } from 'express';
import { BrokerAccountService } from './brokerAccount.service';

@Controller('brokerAcc')
export class BrokerAccountController {
  constructor(private readonly brokerAccService: BrokerAccountService) {}

  @Post('createBrokerAcc')
  @UseGuards(JwtAuthGuard)
  async createBrokerAccount(
    @Body() brokeraccountdto: BrokerAccountDto,
    @Res() res: Response,
  ) {
    await this.brokerAccService.createBrokerAccount(brokeraccountdto, res);
    return { message: 'Broker Account created successfully.' };
  }
}
