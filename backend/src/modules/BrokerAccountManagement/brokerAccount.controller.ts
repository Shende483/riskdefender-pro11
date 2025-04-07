import {
  Body,
  Controller,
  Post,
  Res,
  Req,
  UseGuards,
  Query,
  Get,
  Param,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { BrokerAccountDto } from './dto/brokerAccount.dto';
import { Response, Request } from 'express';
import { BrokerAccountService } from './brokerAccount.service';

@Controller('brokerAccount')
export class BrokerAccountController {
  constructor(private readonly brokerAccService: BrokerAccountService) {}

  @Post('createBrokerAccount')
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
    console.log('updatedDto', updatedDto);
    await this.brokerAccService.createBrokerAccount(updatedDto, res);
    return { message: 'Broker Account created successfully.' };
  }

  @Get('broker-details')
  @UseGuards(JwtAuthGuard)
  async getBrokerDetails(
    @Query('marketTypeId') marketTypeId: string,
    @Req() req: Request,
  ) {
    const { userId } = req['user'];

    if (!userId) {
      return {
        statusCode: 401,
        message: 'User Not Sign In',
        success: true,
      };
    }
    const brokerDetails =
      await this.brokerAccService.getBrokerDetailsByUserIdAndMarketType(
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

  @Get('trading-rules/:id')
  @UseGuards(JwtAuthGuard)
  async getTradingRulesById(@Param('id') id: string, @Req() req: Request) {
    const { userId } = req['user'];

    if (!userId) {
      return {
        statusCode: 401,
        message: 'User Not Signed In',
        success: false,
      };
    }

    const tradingRules =
      await this.brokerAccService.getTradingRulesByBrokerAccountId(id, userId);

    return {
      statusCode: 200,
      message: 'Trading rules retrieved successfully',
      success: true,
      data: tradingRules,
    };
  }
}
