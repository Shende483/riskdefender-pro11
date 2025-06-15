import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UserExitAccountService } from './userTrading.service';

@Controller('user-exit-account')
export class UserExitAccountController {
  constructor(
    private readonly userExitAccountService: UserExitAccountService,
  ) {}

  @Get('usertrading-detail')
  @UseGuards(JwtAuthGuard)
  async getAccounts(
    @Query('brokerId') brokerId: string,
    @Query('marketTypeId') marketTypeId: string,
    @Query('existing') existing: string,
    @Req() req: Request,
  ) {
    const { userId } = req['user'] as { userId: string };

    const data = await this.userExitAccountService.getUserExitAccounts(
      userId,
      brokerId,
      marketTypeId,
      existing,
    );
    return {
      statusCode: 200,
      message: 'User trading data fetched successfully',
      success: true,
      data,
    };
  }
}
