import { WalletBalance } from '../entities/wallet-balance.entity.js';

export abstract class WalletBalanceRepository {
  abstract findByWalletId(walletId: string): Promise<WalletBalance | null>;
  abstract save(walletBalance: WalletBalance): Promise<WalletBalance>;
}
