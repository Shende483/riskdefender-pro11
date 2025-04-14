// userTrading.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { UserExitAccount, UserExitAccountDocument } from './userTrading.schema';

@Injectable()
export class UserExitAccountService {
  constructor(
    @InjectModel(UserExitAccount.name)
    private readonly userExitAccountModel: Model<UserExitAccountDocument>,
  ) {}

  async getUserExitAccounts(
    userId: string,
    brokerId: string,
    marketTypeId: string,
    existing: string,
  ) {
    const query: FilterQuery<UserExitAccount> = {
      userId: new Types.ObjectId(userId),
      brokerId: new Types.ObjectId(brokerId),
      marketTypeId: new Types.ObjectId(marketTypeId),
      [`existing.${existing}`]: { $exists: true },
    };
    const account = await this.userExitAccountModel.find(query).exec();

    console.log('result', account);

    if (!account || account.length === 0) {
      throw new NotFoundException('No trading data found for given criteria');
    }
    if (typeof existing !== 'string') {
      throw new BadRequestException(`Invalid type for existing key`);
    }

    const existingObj =
      account[0]?.existing?.[existing as keyof (typeof account)[0]['existing']];
    if (!existingObj) {
      throw new NotFoundException(
        `No data found for existing key "${existing}"`,
      );
    }
    return existingObj;
  }
}
