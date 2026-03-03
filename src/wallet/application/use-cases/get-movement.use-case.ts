import { Injectable, NotFoundException } from '@nestjs/common';
import { Movement } from '../../domain/entities/movement.entity.js';
import { MovementRepository } from '../../domain/repositories/movement.repository.js';

@Injectable()
export class GetMovementUseCase {
  constructor(private readonly movementRepository: MovementRepository) {}

  async execute(id: string): Promise<Movement> {
    const movement = await this.movementRepository.findById(id);
    if (!movement) {
      throw new NotFoundException(`Movement with id ${id} not found`);
    }
    return movement;
  }
}
