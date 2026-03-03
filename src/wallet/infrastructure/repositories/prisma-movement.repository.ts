import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma.service.js';
import { Movement } from '../../domain/entities/movement.entity.js';
import { MovementStatus } from '../../domain/enums/movement-status.enum.js';
import { MovementType } from '../../domain/enums/movement-type.enum.js';
import { MovementRepository } from '../../domain/repositories/movement.repository.js';

@Injectable()
export class PrismaMovementRepository extends MovementRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async save(movement: Movement): Promise<Movement> {
    const data = {
      id: movement.id,
      userId: movement.userId,
      walletId: movement.walletId,
      type: movement.type,
      amount: movement.amount,
      cost: movement.cost,
      status: movement.status,
      reason: movement.reason ?? null,
    };

    const record = await this.prisma.movement.upsert({
      where: { id: movement.id },
      update: {
        status: data.status,
        reason: data.reason,
      },
      create: data,
    });

    return this.toDomain(record);
  }

  async findById(id: string): Promise<Movement | null> {
    const record = await this.prisma.movement.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async findByWalletId(walletId: string): Promise<Movement[]> {
    const records = await this.prisma.movement.findMany({
      where: { walletId },
    });
    return records.map((r) => this.toDomain(r));
  }

  private toDomain(record: any): Movement {
    return new Movement({
      id: record.id,
      userId: record.userId,
      walletId: record.walletId,
      type: record.type as MovementType,
      amount: record.amount,
      cost: record.cost,
      status: record.status as MovementStatus,
      reason: record.reason ?? undefined,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
