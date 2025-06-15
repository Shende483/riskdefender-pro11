import { Controller, Post, Body, Get, Param, UseGuards, Req, Res } from '@nestjs/common';
import { DeleteUserSubaccountService } from './delete-user-subaccount.service';
import { DeleteUserSubaccountDto } from './delete-user-subaccount-dto/delete-user-subaccount.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Request, Response } from 'express';

@Controller('cron-user-subaccounts')
export class DeleteUserSubaccountController {
  constructor(private deleteUserSubaccountService: DeleteUserSubaccountService) {}

  @Post('delete')
  @UseGuards(JwtAuthGuard)
  async requestDeletion(
    @Body() body: DeleteUserSubaccountDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    console.log('Received request for deleting subaccount:', body);
    const { userId } = req['user'];
    const { brokerAccountId } = body;
    if (!userId) {
      return res.status(401).json({
        statusCode: 401,
        message: 'User not signed in',
        success: false,
      });
    }
    await this.deleteUserSubaccountService.requestDeletion(userId, brokerAccountId, req, res);
  }

  @Post('cancel-deletion')
  @UseGuards(JwtAuthGuard)
  async cancelDeletion(
    @Body() body: DeleteUserSubaccountDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    console.log('Received request for cancelling subaccount deletion:', body);
    const { userId } = req['user'];
    const { brokerAccountId } = body;
    if (!userId) {
      return res.status(401).json({
        statusCode: 401,
        message: 'User not signed in',
        success: false,
      });
    }
    await this.deleteUserSubaccountService.cancelDeletion(userId, brokerAccountId, req, res);
  }

 
}