import { Injectable } from '@nestjs/common';
import { CompanyBalance } from '../../domain/entities/company-balance.entity.js';
import { CompanyBalanceRepository } from '../../domain/repositories/company-balance.repository.js';

@Injectable()
export class GetCompanyBalanceUseCase {
  constructor(
    private readonly companyBalanceRepository: CompanyBalanceRepository,
  ) {}

  async execute(): Promise<CompanyBalance> {
    return this.companyBalanceRepository.get();
  }
}
