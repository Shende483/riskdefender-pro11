import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { OrderPlacementDto } from './dto/orderPlacement.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { OrderPlacementService } from './orderPlacement.service';
import { Response } from 'express';

@Controller('order')
export class OrderPlacementController {
  constructor(private readonly orderPlacementService: OrderPlacementService) {}

  @Post('createOrderTemplate')
  @UseGuards(JwtAuthGuard)
  async createOrderTemplate(
    @Body() createOrderDto: OrderPlacementDto,
    @Res() res: Response,
  ) {
    await this.orderPlacementService.createOrderTemplate(createOrderDto, res);
    return { messege: 'Order Template Created Successfully' };
  }
}
