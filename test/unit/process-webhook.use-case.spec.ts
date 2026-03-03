import { BadRequestException, NotFoundException } from '@nestjs/common';
import { WebhookEventDto } from '../../src/wallet/application/dto/webhook-event.dto.js';
import { ProcessWebhookUseCase } from '../../src/wallet/application/use-cases/process-webhook.use-case.js';
import { Movement } from '../../src/wallet/domain/entities/movement.entity.js';
import { WalletBalance } from '../../src/wallet/domain/entities/wallet-balance.entity.js';
import { MovementStatus } from '../../src/wallet/domain/enums/movement-status.enum.js';
import { MovementType } from '../../src/wallet/domain/enums/movement-type.enum.js';
import { InMemoryCompanyBalanceRepository } from '../../src/wallet/infrastructure/repositories/in-memory-company-balance.repository.js';
import { InMemoryMovementRepository } from '../../src/wallet/infrastructure/repositories/in-memory-movement.repository.js';
import { InMemoryWalletBalanceRepository } from '../../src/wallet/infrastructure/repositories/in-memory-wallet-balance.repository.js';
import { InMemoryWebhookEventRepository } from '../../src/wallet/infrastructure/repositories/in-memory-webhook-event.repository.js';

describe('ProcessWebhookUseCase', () => {
  let useCase: ProcessWebhookUseCase;
  let movementRepo: InMemoryMovementRepository;
  let walletBalanceRepo: InMemoryWalletBalanceRepository;
  let companyBalanceRepo: InMemoryCompanyBalanceRepository;
  let webhookEventRepo: InMemoryWebhookEventRepository;

  beforeEach(() => {
    movementRepo = new InMemoryMovementRepository();
    walletBalanceRepo = new InMemoryWalletBalanceRepository();
    companyBalanceRepo = new InMemoryCompanyBalanceRepository();
    webhookEventRepo = new InMemoryWebhookEventRepository();
    useCase = new ProcessWebhookUseCase(
      movementRepo,
      walletBalanceRepo,
      companyBalanceRepo,
      webhookEventRepo,
    );
  });

  const seedDeposit = async (id = 'mov-dep-001') => {
    const movement = new Movement({
      id,
      userId: 'usr-001',
      walletId: 'wal-001',
      type: MovementType.DEPOSIT,
      amount: 120,
      cost: 1,
      status: MovementStatus.CREATED,
    });
    await movementRepo.save(movement);
    await walletBalanceRepo.save(new WalletBalance({ walletId: 'wal-001' }));
    return movement;
  };

  const seedDebit = async (id = 'mov-debit-001', walletBalance = 120) => {
    const movement = new Movement({
      id,
      userId: 'usr-001',
      walletId: 'wal-001',
      type: MovementType.DEBIT,
      amount: 20,
      cost: 0.2,
      status: MovementStatus.CREATED,
    });
    await movementRepo.save(movement);
    await walletBalanceRepo.save(
      new WalletBalance({ walletId: 'wal-001', balance: walletBalance }),
    );
    return movement;
  };

  const makeWebhookDto = (
    overrides: Partial<WebhookEventDto> = {},
  ): WebhookEventDto => {
    const dto = new WebhookEventDto();
    dto.eventId = 'evt-001';
    dto.movementId = 'mov-dep-001';
    dto.type = MovementType.DEPOSIT;
    dto.amount = 120;
    dto.cost = 1;
    dto.status = MovementStatus.COMPLETED;
    dto.processedAt = '2026-02-26T12:02:00Z';
    dto.reason = null;
    return Object.assign(dto, overrides);
  };

  // --- DEPOSIT FLOW ---

  it('DEPOSIT -> COMPLETED: should update wallet balance and company income', async () => {
    await seedDeposit();

    const dto = makeWebhookDto({
      status: MovementStatus.COMPLETED,
    });

    const result = await useCase.execute(dto);

    expect(result.message).toBe('Webhook processed successfully');
    expect(result.movement.status).toBe(MovementStatus.COMPLETED);

    const walletBalance = await walletBalanceRepo.findByWalletId('wal-001');
    expect(walletBalance!.balance).toBe(120);

    const companyBalance = await companyBalanceRepo.get();
    expect(companyBalance.totalIncome).toBe(1); // fixed fee for DEPOSIT
  });

  it('DEPOSIT -> FAILED: should not change balances', async () => {
    await seedDeposit();

    const dto = makeWebhookDto({
      status: MovementStatus.FAILED,
      reason: 'DEPOSIT_REJECTED',
    });

    const result = await useCase.execute(dto);

    expect(result.movement.status).toBe(MovementStatus.FAILED);
    expect(result.movement.reason).toBe('DEPOSIT_REJECTED');

    const walletBalance = await walletBalanceRepo.findByWalletId('wal-001');
    expect(walletBalance!.balance).toBe(0);

    const companyBalance = await companyBalanceRepo.get();
    expect(companyBalance.totalIncome).toBe(0);
  });

  // --- DEBIT FLOW ---

  it('DEBIT -> COMPLETED: should debit wallet and add fee to company', async () => {
    await seedDebit();

    const dto = makeWebhookDto({
      eventId: 'evt-debit-001',
      movementId: 'mov-debit-001',
      type: MovementType.DEBIT,
      amount: 20,
      cost: 0.2,
      status: MovementStatus.COMPLETED,
    });

    const result = await useCase.execute(dto);

    expect(result.movement.status).toBe(MovementStatus.COMPLETED);

    const walletBalance = await walletBalanceRepo.findByWalletId('wal-001');
    expect(walletBalance!.balance).toBe(100); // 120 - 20

    const companyBalance = await companyBalanceRepo.get();
    expect(companyBalance.totalIncome).toBe(0.2); // 1% of 20
  });

  it('DEBIT -> FAILED: should not change balances', async () => {
    await seedDebit();

    const dto = makeWebhookDto({
      eventId: 'evt-debit-fail-001',
      movementId: 'mov-debit-001',
      type: MovementType.DEBIT,
      amount: 20,
      cost: 0.2,
      status: MovementStatus.FAILED,
      reason: 'INSUFFICIENT_FUNDS',
    });

    const result = await useCase.execute(dto);

    expect(result.movement.status).toBe(MovementStatus.FAILED);

    const walletBalance = await walletBalanceRepo.findByWalletId('wal-001');
    expect(walletBalance!.balance).toBe(120);

    const companyBalance = await companyBalanceRepo.get();
    expect(companyBalance.totalIncome).toBe(0);
  });

  // --- IDEMPOTENCY ---

  it('should be idempotent: processing same eventId twice returns cached result', async () => {
    await seedDeposit();

    const dto = makeWebhookDto({ status: MovementStatus.COMPLETED });

    const result1 = await useCase.execute(dto);
    expect(result1.message).toBe('Webhook processed successfully');

    const result2 = await useCase.execute(dto);
    expect(result2.message).toBe('Event already processed (idempotent)');
  });

  // --- INVALID TRANSITIONS ---

  it('should reject invalid status transition', async () => {
    await seedDeposit();

    const dto1 = makeWebhookDto({ status: MovementStatus.COMPLETED });
    await useCase.execute(dto1);

    const dto2 = makeWebhookDto({
      eventId: 'evt-002',
      status: MovementStatus.FAILED,
    });

    await expect(useCase.execute(dto2)).rejects.toThrow(BadRequestException);
  });

  // --- MOVEMENT NOT FOUND ---

  it('should throw NotFoundException when movement does not exist', async () => {
    const dto = makeWebhookDto({ movementId: 'non-existent' });

    await expect(useCase.execute(dto)).rejects.toThrow(NotFoundException);
  });
});
