import { BadRequestException, ConflictException } from '@nestjs/common';
import { CreateMovementUseCase } from './create-movement.use-case.js';
import { CreateMovementDto } from '../dto/create-movement.dto.js';
import { MovementStatus } from '../../domain/enums/movement-status.enum.js';
import { MovementType } from '../../domain/enums/movement-type.enum.js';
import { InMemoryMovementRepository } from '../../infrastructure/repositories/in-memory-movement.repository.js';
import { InMemoryWalletBalanceRepository } from '../../infrastructure/repositories/in-memory-wallet-balance.repository.js';
import { WalletBalance } from '../../domain/entities/wallet-balance.entity.js';

describe('CreateMovementUseCase', () => {
  let useCase: CreateMovementUseCase;
  let movementRepo: InMemoryMovementRepository;
  let walletBalanceRepo: InMemoryWalletBalanceRepository;

  beforeEach(() => {
    movementRepo = new InMemoryMovementRepository();
    walletBalanceRepo = new InMemoryWalletBalanceRepository();
    useCase = new CreateMovementUseCase(movementRepo, walletBalanceRepo);
  });

  const makeDepositDto = (overrides?: Partial<CreateMovementDto>): CreateMovementDto => {
    const dto = new CreateMovementDto();
    dto.id = 'mov-001';
    dto.userId = 'usr-001';
    dto.walletId = 'wal-001';
    dto.type = MovementType.DEPOSIT;
    dto.amount = 100;
    dto.cost = 1;
    dto.status = MovementStatus.CREATED;
    return Object.assign(dto, overrides);
  };

  const makeDebitDto = (overrides?: Partial<CreateMovementDto>): CreateMovementDto => {
    const dto = new CreateMovementDto();
    dto.id = 'mov-002';
    dto.userId = 'usr-001';
    dto.walletId = 'wal-001';
    dto.type = MovementType.DEBIT;
    dto.amount = 50;
    dto.cost = 0.5;
    dto.status = MovementStatus.CREATED;
    return Object.assign(dto, overrides);
  };

  it('should create a DEPOSIT movement successfully', async () => {
    const dto = makeDepositDto();
    const result = await useCase.execute(dto);

    expect(result.id).toBe('mov-001');
    expect(result.type).toBe(MovementType.DEPOSIT);
    expect(result.status).toBe(MovementStatus.CREATED);
  });

  it('should reject movement with status other than CREATED', async () => {
    const dto = makeDepositDto({ status: MovementStatus.COMPLETED });

    await expect(useCase.execute(dto)).rejects.toThrow(BadRequestException);
  });

  it('should reject duplicate movement id', async () => {
    const dto = makeDepositDto();
    await useCase.execute(dto);

    await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
  });

  it('should reject first movement if not DEPOSIT', async () => {
    const dto = makeDebitDto();

    await expect(useCase.execute(dto)).rejects.toThrow(BadRequestException);
    await expect(useCase.execute(dto)).rejects.toThrow(
      'The first movement for a wallet must be a DEPOSIT',
    );
  });

  it('should reject DEBIT when insufficient balance', async () => {
    // Create wallet with some balance
    const depositDto = makeDepositDto();
    await useCase.execute(depositDto);

    // Simulate balance = 0 (CREATED doesn't apply balance)
    const debitDto = makeDebitDto({ amount: 100 });

    await expect(useCase.execute(debitDto)).rejects.toThrow(BadRequestException);
    await expect(useCase.execute(debitDto)).rejects.toThrow('Insufficient balance');
  });

  it('should allow DEBIT when balance is sufficient', async () => {
    // Setup wallet with balance
    await walletBalanceRepo.save(new WalletBalance({ walletId: 'wal-001', balance: 200 }));

    // First deposit to establish wallet
    const depositDto = makeDepositDto();
    await useCase.execute(depositDto);

    const debitDto = makeDebitDto({ amount: 50 });
    const result = await useCase.execute(debitDto);

    expect(result.id).toBe('mov-002');
    expect(result.type).toBe(MovementType.DEBIT);
    expect(result.status).toBe(MovementStatus.CREATED);
  });
});
