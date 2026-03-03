import {
    BadRequestException,
    ConflictException,
    Injectable,
} from '@nestjs/common';
import { Movement } from '../../domain/entities/movement.entity.js';
import { WalletBalance } from '../../domain/entities/wallet-balance.entity.js';
import { MovementStatus } from '../../domain/enums/movement-status.enum.js';
import { MovementType } from '../../domain/enums/movement-type.enum.js';
import { MovementRepository } from '../../domain/repositories/movement.repository.js';
import { WalletBalanceRepository } from '../../domain/repositories/wallet-balance.repository.js';
import { CreateMovementDto } from '../dto/create-movement.dto.js';

@Injectable()
export class CreateMovementUseCase {
  constructor(
    private readonly movementRepository: MovementRepository,
    private readonly walletBalanceRepository: WalletBalanceRepository,
  ) {}

  async execute(dto: CreateMovementDto): Promise<Movement> {
    if (!dto.id) {
      throw new BadRequestException('Movement id is required');
    }

    if (!dto.walletId) {
      throw new BadRequestException('Wallet id is required');
    }

    if (!dto.userId) {
      throw new BadRequestException('User id is required');
    }

    if (!dto.type) {
      throw new BadRequestException('Movement type is required');
    }

    if (dto.amount === undefined || dto.amount === null) {
      throw new BadRequestException('Movement amount is required');
    }

    if (dto.cost === undefined || dto.cost === null) {
      throw new BadRequestException('Movement cost is required');
    }

    if (dto.status !== MovementStatus.CREATED) {
      throw new BadRequestException(
        'Movement must be created with status CREATED',
      );
    }

    const existing = await this.movementRepository.findById(dto.id);
    if (existing) {
      throw new ConflictException(`Movement with id ${dto.id} already exists`);
    }

    const walletBalance = await this.walletBalanceRepository.findByWalletId(
      dto.walletId,
    );

    await this.validateFirstMovement(dto, walletBalance);
    this.validateSufficientBalance(dto, walletBalance);

    const movement = new Movement({
      id: dto.id,
      userId: dto.userId,
      walletId: dto.walletId,
      type: dto.type,
      amount: dto.amount,
      cost: dto.cost,
      status: MovementStatus.CREATED,
    });

    if (!walletBalance) {
      await this.walletBalanceRepository.save(
        new WalletBalance({ walletId: dto.walletId }),
      );
    }

    return this.movementRepository.save(movement);
  }

  private async validateFirstMovement(
    dto: CreateMovementDto,
    walletBalance: WalletBalance | null,
  ): Promise<void> {
    if (!walletBalance) {
      const existingMovements = await this.movementRepository.findByWalletId(
        dto.walletId!,
      );
      if (existingMovements.length === 0 && dto.type !== MovementType.DEPOSIT) {
        throw new BadRequestException(
          'The first movement for a wallet must be a DEPOSIT',
        );
      }
    }
  }

  private validateSufficientBalance(
    dto: CreateMovementDto,
    walletBalance: WalletBalance | null,
  ): void {
    if (
      dto.type === MovementType.DEBIT ||
      dto.type === MovementType.FORCE_DEBIT
    ) {
      const currentBalance = walletBalance?.balance ?? 0;
      if (currentBalance < dto.amount!) {
        throw new BadRequestException(
          `Insufficient balance. Current: ${currentBalance}, Required: ${dto.amount}`,
        );
      }
    }
  }
}
