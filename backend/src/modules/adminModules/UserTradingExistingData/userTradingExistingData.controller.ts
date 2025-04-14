import { Controller, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UserTradingExistingService } from './userTradingExistingData.service';
import { UserTradingExistingDto } from './dto/UserTradingExistingData.dto';

@Controller('admin/userTradingExistingData')
export class UserTradingExistingController {
    constructor(private readonly userTradingService: UserTradingExistingService) { }

    @Post('CreateTemplates')
    @UseGuards(JwtAuthGuard)
    async createTradingTemplate(
        @Body() tradingTemplate: UserTradingExistingDto,
        @Res() res: Response,
    ) {
        return this.userTradingService.createTemplate(
            tradingTemplate,
            res,
        );
    }
}