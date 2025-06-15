


import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Request, Response } from 'express';
import { BrokerAccount, BrokerAccountDocument } from 'src/modules/sidebar-management/subaccount-management/sub-broker-account.schema';
import { PendingDeletion, PendingDeletionDocument } from './delete-user-subaccount.schema';

@Injectable()
export class DeleteUserSubaccountService implements OnModuleInit {
  constructor(
    private schedulerRegistry: SchedulerRegistry,
    @InjectModel(BrokerAccount.name) private brokerAccountModel: Model<BrokerAccountDocument>,
    @InjectModel(PendingDeletion.name) private pendingDeletionModel: Model<PendingDeletionDocument>,
  ) {}

  async onModuleInit() {
    const now = new Date();
    const pendingDeletions = await this.pendingDeletionModel.find().exec();

    for (const deletion of pendingDeletions) {
      if (deletion.deleteAt >= now) {
        await this.scheduleDeletion(
          deletion.userId.toString(),
          deletion.brokerAccountId.toString(),
          deletion.deleteAt
        );
        console.log(
          `Restored cron job for subaccount ${deletion.brokerAccountId}, scheduled for ${deletion.deleteAt.toISOString()}`
        );
      } else {
        await this.executeDeletion(
          deletion.userId.toString(),
          deletion.brokerAccountId.toString()
        );
        console.log(
          `Immediately deleted overdue subaccount ${deletion.brokerAccountId} for user ${deletion.userId}`
        );
      }
    }

    await this.pendingDeletionModel.deleteMany({ deleteAt: { $lt: now } }).exec();
  }

  private async scheduleDeletion(userId: string, brokerAccountId: string, deleteAt: Date) {
    const cronName = `subaccount_${brokerAccountId}`;
    const timeToDeletion = deleteAt.getTime() - Date.now();

    if (timeToDeletion <= 0) {
      await this.executeDeletion(userId, brokerAccountId);
      return;
    }

    const timeout = setTimeout(async () => {
      await this.executeDeletion(userId, brokerAccountId);
      this.schedulerRegistry.deleteTimeout(cronName);
    }, timeToDeletion);

    this.schedulerRegistry.addTimeout(cronName, timeout);
  }

  private async executeDeletion(userId: string, brokerAccountId: string) {
    await this.brokerAccountModel
      .deleteOne({ _id: brokerAccountId })
      .exec();
    await this.pendingDeletionModel.deleteOne({ brokerAccountId }).exec();
    console.log(
      `Subaccount ${brokerAccountId} permanently deleted for user ${userId} at ${new Date().toISOString()}`
    );
  }

  async requestDeletion(userId: string, brokerAccountId: string, req: Request, res: Response) {
    const account = await this.brokerAccountModel
      .findOne({ _id: brokerAccountId, userId })
      .exec();

    if (!account) {
      return res.status(404).json({
        statusCode: 404,
        message: `Subaccount ${brokerAccountId} not found for user ${userId}`,
        success: false,
      });
    }

    const existingDeletion = await this.pendingDeletionModel
      .findOne({ brokerAccountId })
      .exec();

    if (existingDeletion) {
      return res.status(400).json({
        statusCode: 400,
        message: `Subaccount ${brokerAccountId} already scheduled for deletion`,
        success: false,
      });
    }

    const deleteAt = new Date();
    deleteAt.setMinutes(deleteAt.getMinutes() + 1);

    await this.pendingDeletionModel.create({
      userId,
      brokerAccountId,
      deleteAt,
    });

    await this.scheduleDeletion(userId, brokerAccountId, deleteAt);

    return res.status(200).json({
      statusCode: 200,
      message: `Subaccount ${brokerAccountId} scheduled for deletion on ${deleteAt.toISOString()}`,
      success: true,
    });
  }

  async cancelDeletion(userId: string, brokerAccountId: string, req: Request, res: Response) {
    const deletion = await this.pendingDeletionModel
      .findOne({ brokerAccountId, userId })
      .exec();

    if (!deletion) {
      return res.status(404).json({
        statusCode: 404,
        message: `No deletion request found for subaccount ${brokerAccountId}`,
        success: false,
      });
    }

    await this.pendingDeletionModel.deleteOne({ _id: deletion._id }).exec();

    const cronName = `subaccount_${brokerAccountId}`;
    if (this.schedulerRegistry.doesExist('timeout', cronName)) {
      this.schedulerRegistry.deleteTimeout(cronName);
    }

    return res.status(200).json({
      statusCode: 200,
      message: `Deletion request for subaccount ${brokerAccountId} cancelled`,
      success: true,
    });
  }
}