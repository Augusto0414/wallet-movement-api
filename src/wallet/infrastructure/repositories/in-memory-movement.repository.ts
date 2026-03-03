import { Injectable } from '@nestjs/common';
import { Movement } from '../../domain/entities/movement.entity.js';
import { MovementRepository } from '../../domain/repositories/movement.repository.js';

@Injectable()
export class InMemoryMovementRepository extends MovementRepository {
  private readonly movements = new Map<string, Movement>();

  async save(movement: Movement): Promise<Movement> {
    this.movements.set(movement.id, movement);
    return movement;
  }

  async findById(id: string): Promise<Movement | null> {
    return this.movements.get(id) ?? null;
  }

  async findByWalletId(walletId: string): Promise<Movement[]> {
    return Array.from(this.movements.values()).filter(
      (m) => m.walletId === walletId,
    );
  }
}
