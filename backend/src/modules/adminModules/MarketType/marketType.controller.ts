import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { MarketTypeService } from './marketType.service';
import { ApiBody } from '@nestjs/swagger';

@Controller('Admin/market-type')
export class MarketTypeController {
  constructor(private readonly marketTypeService: MarketTypeService) {}

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: {type: 'string'},
        status: {type: 'string'}
      },
    },
  })
  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createMarketType(
    @Body() body: { name: string; status: string },
    @Req() req: Request,
    @Res() res: Response,
  ) {
    console.log('Received Body:', body);

    // Extract values from request body
    const { name, status } = body;

    // Validate input
    if (!name || !status) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Missing required fields: name or status',
        success: false,
      });
    }

    try {
      // Call service to create market type
      await this.marketTypeService.createMarketType({ name, status });

      return res.status(200).json({
        message: 'Market Type created successfully',
        success: true,
      });
    } catch (error) {
      console.error('Error creating market type:', error);
      return res.status(500).json({
        message: 'Internal Server Error',
        success: false,
      });
    }
  }

  @Get('getAll')
  @UseGuards(JwtAuthGuard)
  async getAllActiveMarketTypes(@Res() res: Response) {
    try {
      const marketTypes =
        await this.marketTypeService.getAllActiveMarketTypes();

      return res.status(HttpStatus.OK).json({
        success: true,
        data: marketTypes,
      });
    } catch (error) {
      console.error('Error fetching market types:', error);
      return res.status(500).json({
        message: 'Internal Server Error',
        success: false,
      });
    }
  }
}
