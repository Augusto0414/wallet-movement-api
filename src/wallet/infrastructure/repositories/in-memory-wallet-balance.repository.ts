import { Injectable } from '@nestjs/common';
import { WalletBalance } from '../../domain/entities/wallet-balance.entity.js';
import { WalletBalanceRepository } from '../../domain/repositories/wallet-balance.repository.js';

@Injectable()
export class InMemoryWalletBalanceRepository extends WalletBalanceRepository {
  private readonly balances = new Map<string, WalletBalance>();

  async findByWalletId(walletId: string): Promise<WalletBalance | null> {
    return this.balances.get(walletId) ?? null;
  }

  async save(walletBalance: WalletBalance): Promise<WalletBalance> {
    this.balances.set(walletBalance.walletId, walletBalance);
    return walletBalance;
  }
}
