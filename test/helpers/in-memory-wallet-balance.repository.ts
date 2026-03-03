import { WalletBalance } from '../../src/wallet/domain/entities/wallet-balance.entity.js';
import { WalletBalanceRepository } from '../../src/wallet/domain/repositories/wallet-balance.repository.js';

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
