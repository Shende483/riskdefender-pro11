import { Controller, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreateUserAccountDetailsDto } from './dto/userAccountDetail.dto';
import { UserAccountDetailsService } from './userAccountDetail.service';

@Controller('admin/UserAccountDetails')
export class UserAccountDetailsController {
    constructor(private readonly userAccountService: UserAccountDetailsService) { }

    @Post('CreateTemplate')
    @UseGuards(JwtAuthGuard)
    async createRules(
        @Body() templateData: CreateUserAccountDetailsDto,
        @Res() res: Response,
    ) {
        return this.userAccountService.createTemplate(
            templateData,
            res,
        );
    }
}