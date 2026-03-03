import { Injectable } from '@nestjs/common';
import { CompanyBalance } from '../../domain/entities/company-balance.entity.js';
import { CompanyBalanceRepository } from '../../domain/repositories/company-balance.repository.js';

@Injectable()
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
