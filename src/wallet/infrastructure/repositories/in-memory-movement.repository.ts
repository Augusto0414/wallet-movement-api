import { Injectable } from '@nestjs/common';
import { Movement } from '../../domain/entities/movement.entity.js';
import { MovementRepository } from '../../domain/repositories/movement.repository.js';

@Injectable()
export class InMemoryMovementRepository extends MovementRepository {
  private readonly movements = new Map<string, Movement>();

  save(movement: Movement): Promise<Movement> {
    this.movements.set(movement.id, movement);
    return Promise.resolve(movement);
  }

  findById(id: string): Promise<Movement | null> {
    return Promise.resolve(this.movements.get(id) ?? null);
  }

  findByWalletId(walletId: string): Promise<Movement[]> {
    return Promise.resolve(
      Array.from(this.movements.values()).filter(
        (m) => m.walletId === walletId,
      ),
    );
  }
}
