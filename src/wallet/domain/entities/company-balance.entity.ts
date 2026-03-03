export class CompanyBalance {
  public totalIncome: number;
  public updatedAt: Date;

  constructor(params?: { totalIncome?: number; updatedAt?: Date }) {
    this.totalIncome = params?.totalIncome ?? 0;
    this.updatedAt = params?.updatedAt ?? new Date();
  }

  addIncome(amount: number): void {
    this.totalIncome += amount;
    this.updatedAt = new Date();
  }
}
