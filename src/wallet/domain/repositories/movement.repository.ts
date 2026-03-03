import { Movement } from '../entities/movement.entity.js';

export abstract class MovementRepository {
  abstract save(movement: Movement): Promise<Movement>;
  abstract findById(id: string): Promise<Movement | null>;
  abstract findByWalletId(walletId: string): Promise<Movement[]>;
}
