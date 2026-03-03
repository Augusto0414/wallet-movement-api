import { Injectable, NotFoundException } from '@nestjs/common';
import { WalletBalance } from '../../domain/entities/wallet-balance.entity.js';
import { WalletBalanceRepository } from '../../domain/repositories/wallet-balance.repository.js';

@Injectable()
export class GetWalletBalanceUseCase {
  constructor(
    private readonly walletBalanceRepository: WalletBalanceRepository,
  ) {}

  async execute(walletId: string): Promise<WalletBalance> {
    const balance = await this.walletBalanceRepository.findByWalletId(walletId);
    if (!balance) {
      throw new NotFoundException(`Wallet with id ${walletId} not found`);
    }
    return balance;
  }
}
