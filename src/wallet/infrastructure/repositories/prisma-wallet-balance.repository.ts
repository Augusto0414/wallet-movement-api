import { Injectable } from '@nestjs/common';
import { WalletBalance as PrismaWalletBalance } from '../../../../generated/prisma/client.js';
import { PrismaService } from '../../../shared/prisma.service.js';
import { WalletBalance } from '../../domain/entities/wallet-balance.entity.js';
import { WalletBalanceRepository } from '../../domain/repositories/wallet-balance.repository.js';

@Injectable()
export class PrismaWalletBalanceRepository extends WalletBalanceRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findByWalletId(walletId: string): Promise<WalletBalance | null> {
    const record = await this.prisma.walletBalance.findUnique({
      where: { walletId },
    });
    return record ? this.toDomain(record) : null;
  }

  async save(walletBalance: WalletBalance): Promise<WalletBalance> {
    const record = await this.prisma.walletBalance.upsert({
      where: { walletId: walletBalance.walletId },
      update: { balance: walletBalance.balance },
      create: {
        walletId: walletBalance.walletId,
        balance: walletBalance.balance,
      },
    });
    return this.toDomain(record);
  }

  private toDomain(record: PrismaWalletBalance): WalletBalance {
    return new WalletBalance({
      walletId: record.walletId,
      balance: record.balance,
      updatedAt: record.updatedAt,
    });
  }
}
