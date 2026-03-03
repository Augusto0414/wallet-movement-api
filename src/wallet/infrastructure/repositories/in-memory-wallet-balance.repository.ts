import { Injectable } from '@nestjs/common';
import { WalletBalance } from '../../domain/entities/wallet-balance.entity.js';
import { WalletBalanceRepository } from '../../domain/repositories/wallet-balance.repository.js';

@Injectable()
export class InMemoryWalletBalanceRepository extends WalletBalanceRepository {
  private readonly balances = new Map<string, WalletBalance>();

  findByWalletId(walletId: string): Promise<WalletBalance | null> {
    return Promise.resolve(this.balances.get(walletId) ?? null);
  }

  save(walletBalance: WalletBalance): Promise<WalletBalance> {
    this.balances.set(walletBalance.walletId, walletBalance);
    return Promise.resolve(walletBalance);
  }
}
