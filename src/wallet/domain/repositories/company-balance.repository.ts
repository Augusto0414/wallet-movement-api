import { CompanyBalance } from '../entities/company-balance.entity.js';

export abstract class CompanyBalanceRepository {
  abstract get(): Promise<CompanyBalance>;
  abstract save(companyBalance: CompanyBalance): Promise<CompanyBalance>;
}
