import { BadRequestException, ConflictException } from '@nestjs/common';
import { CreateMovementDto } from '../../src/wallet/application/dto/create-movement.dto.js';
import { CreateMovementUseCase } from '../../src/wallet/application/use-cases/create-movement.use-case.js';
import { WalletBalance } from '../../src/wallet/domain/entities/wallet-balance.entity.js';
import { MovementStatus } from '../../src/wallet/domain/enums/movement-status.enum.js';
import { MovementType } from '../../src/wallet/domain/enums/movement-type.enum.js';
import { InMemoryMovementRepository } from '../helpers/in-memory-movement.repository.js';
import { InMemoryWalletBalanceRepository } from '../helpers/in-memory-wallet-balance.repository.js';

describe('CreateMovementUseCase', () => {
  let useCase: CreateMovementUseCase;
  let movementRepo: InMemoryMovementRepository;
  let walletBalanceRepo: InMemoryWalletBalanceRepository;

  beforeEach(() => {
    movementRepo = new InMemoryMovementRepository();
    walletBalanceRepo = new InMemoryWalletBalanceRepository();
    useCase = new CreateMovementUseCase(movementRepo, walletBalanceRepo);
  });

  const makeDepositDto = (
    overrides?: Partial<CreateMovementDto>,
  ): CreateMovementDto => {
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

  const makeDebitDto = (
    overrides?: Partial<CreateMovementDto>,
  ): CreateMovementDto => {
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
    const depositDto = makeDepositDto();
    await useCase.execute(depositDto);

    const debitDto = makeDebitDto({ amount: 100 });

    await expect(useCase.execute(debitDto)).rejects.toThrow(
      BadRequestException,
    );
    await expect(useCase.execute(debitDto)).rejects.toThrow(
      'Insufficient balance',
    );
  });

  it('should allow DEBIT when balance is sufficient', async () => {
    await walletBalanceRepo.save(
      new WalletBalance({ walletId: 'wal-001', balance: 200 }),
    );

    const depositDto = makeDepositDto();
    await useCase.execute(depositDto);

    const debitDto = makeDebitDto({ amount: 50 });
    const result = await useCase.execute(debitDto);

    expect(result.id).toBe('mov-002');
    expect(result.type).toBe(MovementType.DEBIT);
    expect(result.status).toBe(MovementStatus.CREATED);
  });
});
