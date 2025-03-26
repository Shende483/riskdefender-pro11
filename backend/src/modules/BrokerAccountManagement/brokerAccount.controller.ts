import { Body, Controller, Post, Res, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { BrokerAccountDto } from './dto/brokerAccount.dto';
import { Response, Request } from 'express';
import { BrokerAccountService } from './brokerAccount.service';

@Controller('brokerAcc')
export class BrokerAccountController {
  constructor(private readonly brokerAccService: BrokerAccountService) {}

  @Post('createBrokerAcc')
  @UseGuards(JwtAuthGuard)
  async createBrokerAccount(
    @Body() brokeraccountdto: BrokerAccountDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    console.log('User from Token:', req['user']);
    
    const { userId, email } = req['user'];
    console.log(`UserId: ${userId}, Email: ${email}`);

    if (!userId) {
      return res.status(400).json({
        statusCode: 400,
        message: 'UserId is required',
        success: false,
      });
    }

    // Add the userId from the token to the DTO
    const updatedDto = { ...brokeraccountdto, userId };

    await this.brokerAccService.createBrokerAccount(updatedDto, res);
    return { message: 'Broker Account created successfully.' };
  }
}