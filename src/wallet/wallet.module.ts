import { Module } from '@nestjs/common';
import { CreateMovementUseCase } from './application/use-cases/create-movement.use-case.js';
import { GetCompanyBalanceUseCase } from './application/use-cases/get-company-balance.use-case.js';
import { GetMovementUseCase } from './application/use-cases/get-movement.use-case.js';
import { GetWalletBalanceUseCase } from './application/use-cases/get-wallet-balance.use-case.js';
import { ProcessWebhookUseCase } from './application/use-cases/process-webhook.use-case.js';
import { CompanyBalanceRepository } from './domain/repositories/company-balance.repository.js';
import { MovementRepository } from './domain/repositories/movement.repository.js';
import { WalletBalanceRepository } from './domain/repositories/wallet-balance.repository.js';
import { WebhookEventRepository } from './domain/repositories/webhook-event.repository.js';
import { PrismaCompanyBalanceRepository } from './infrastructure/repositories/prisma-company-balance.repository.js';
import { PrismaMovementRepository } from './infrastructure/repositories/prisma-movement.repository.js';
import { PrismaWalletBalanceRepository } from './infrastructure/repositories/prisma-wallet-balance.repository.js';
import { PrismaWebhookEventRepository } from './infrastructure/repositories/prisma-webhook-event.repository.js';
import { WalletController } from './interfaces/wallet.controller.js';

@Module({
  controllers: [WalletController],
  providers: [
    CreateMovementUseCase,
    ProcessWebhookUseCase,
    GetMovementUseCase,
    GetWalletBalanceUseCase,
    GetCompanyBalanceUseCase,
    {
      provide: MovementRepository,
      useClass: PrismaMovementRepository,
    },
    {
      provide: WalletBalanceRepository,
      useClass: PrismaWalletBalanceRepository,
    },
    {
      provide: CompanyBalanceRepository,
      useClass: PrismaCompanyBalanceRepository,
    },
    {
      provide: WebhookEventRepository,
      useClass: PrismaWebhookEventRepository,
    },
  ],
})
export class WalletModule {}
