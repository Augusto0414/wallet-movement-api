import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma.service.js';
import { CompanyBalance } from '../../domain/entities/company-balance.entity.js';
import { CompanyBalanceRepository } from '../../domain/repositories/company-balance.repository.js';

@Injectable()
export class PrismaCompanyBalanceRepository extends CompanyBalanceRepository {
  private static readonly SINGLETON_ID = 'singleton';

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async get(): Promise<CompanyBalance> {
    const record = await this.prisma.companyBalance.findUnique({
      where: { id: PrismaCompanyBalanceRepository.SINGLETON_ID },
    });

    if (!record) {
      return new CompanyBalance();
    }

    return new CompanyBalance({
      totalIncome: record.totalIncome,
      updatedAt: record.updatedAt,
    });
  }

  async save(companyBalance: CompanyBalance): Promise<CompanyBalance> {
    const record = await this.prisma.companyBalance.upsert({
      where: { id: PrismaCompanyBalanceRepository.SINGLETON_ID },
      update: { totalIncome: companyBalance.totalIncome },
      create: {
        id: PrismaCompanyBalanceRepository.SINGLETON_ID,
        totalIncome: companyBalance.totalIncome,
      },
    });

    return new CompanyBalance({
      totalIncome: record.totalIncome,
      updatedAt: record.updatedAt,
    });
  }
}
