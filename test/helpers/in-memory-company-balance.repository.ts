import { CompanyBalance } from '../../src/wallet/domain/entities/company-balance.entity.js';
import { CompanyBalanceRepository } from '../../src/wallet/domain/repositories/company-balance.repository.js';

export class InMemoryCompanyBalanceRepository extends CompanyBalanceRepository {
  private companyBalance = new CompanyBalance();

  get(): Promise<CompanyBalance> {
    return Promise.resolve(this.companyBalance);
  }

  save(companyBalance: CompanyBalance): Promise<CompanyBalance> {
    this.companyBalance = companyBalance;
    return Promise.resolve(companyBalance);
  }
}
