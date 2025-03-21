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
import { MarketTypeService } from './market-type.service';
import { Request, Response } from 'express';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('Admin/market-type')
export class MarketTypeController {
  constructor(private readonly marketTypeService: MarketTypeService) {}

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

      return res.status(201).json({
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
