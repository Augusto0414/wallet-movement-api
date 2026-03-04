import { Injectable } from '@nestjs/common';
import { Movement } from '../../domain/entities/movement.entity.js';
import { MovementRepository } from '../../domain/repositories/movement.repository.js';

@Injectable()
export class GetMovementsByWalletIdUseCase {
  constructor(private readonly movementRepository: MovementRepository) {}

  async execute(walletId: string): Promise<Movement[]> {
    return this.movementRepository.findByWalletId(walletId);
  }
}
