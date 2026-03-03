export class WalletBalance {
  public readonly walletId: string;
  public balance: number;
  public updatedAt: Date;

  constructor(params: {
    walletId: string;
    balance?: number;
    updatedAt?: Date;
  }) {
    this.walletId = params.walletId;
    this.balance = params.balance ?? 0;
    this.updatedAt = params.updatedAt ?? new Date();
  }

  credit(amount: number): void {
    this.balance += amount;
    this.updatedAt = new Date();
  }

  debit(amount: number): void {
    this.balance -= amount;
    this.updatedAt = new Date();
  }

  hasSufficientBalance(amount: number): boolean {
    return this.balance >= amount;
  }
}
