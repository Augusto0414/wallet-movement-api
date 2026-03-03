import { Injectable } from '@nestjs/common';
import { CompanyBalance } from '../../domain/entities/company-balance.entity.js';
import { CompanyBalanceRepository } from '../../domain/repositories/company-balance.repository.js';

@Injectable()
export class InMemoryCompanyBalanceRepository extends CompanyBalanceRepository {
  private companyBalance = new CompanyBalance();

  async get(): Promise<CompanyBalance> {
    return this.companyBalance;
  }

  async save(companyBalance: CompanyBalance): Promise<CompanyBalance> {
    this.companyBalance = companyBalance;
    return companyBalance;
  }
}
