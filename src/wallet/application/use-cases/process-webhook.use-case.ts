import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Movement } from '../../domain/entities/movement.entity.js';
import { WalletBalance } from '../../domain/entities/wallet-balance.entity.js';
import { WebhookEvent } from '../../domain/entities/webhook-event.entity.js';
import { MovementStatus } from '../../domain/enums/movement-status.enum.js';
import { MovementType } from '../../domain/enums/movement-type.enum.js';
import { CompanyBalanceRepository } from '../../domain/repositories/company-balance.repository.js';
import { MovementRepository } from '../../domain/repositories/movement.repository.js';
import { WalletBalanceRepository } from '../../domain/repositories/wallet-balance.repository.js';
import { WebhookEventRepository } from '../../domain/repositories/webhook-event.repository.js';
import { WebhookEventDto } from '../dto/webhook-event.dto.js';

@Injectable()
export class ProcessWebhookUseCase {
  constructor(
    private readonly movementRepository: MovementRepository,
    private readonly walletBalanceRepository: WalletBalanceRepository,
    private readonly companyBalanceRepository: CompanyBalanceRepository,
    private readonly webhookEventRepository: WebhookEventRepository,
  ) {}

  async execute(
    dto: WebhookEventDto,
  ): Promise<{ message: string; movement: Movement }> {
    if (!dto.movementId) {
      throw new BadRequestException('movementId is required');
    }

    if (!dto.eventId) {
      throw new BadRequestException('eventId is required');
    }

    const existingEvent = await this.webhookEventRepository.findByEventId(
      dto.eventId,
    );
    if (existingEvent) {
      const movement = await this.movementRepository.findById(dto.movementId);
      return {
        message: 'Event already processed (idempotent)',
        movement: movement!,
      };
    }

    const movement = await this.movementRepository.findById(dto.movementId);
    if (!movement) {
      throw new NotFoundException(
        `Movement with id ${dto.movementId} not found`,
      );
    }

    const newStatus = dto.status;

    if (!newStatus) {
      throw new BadRequestException('status is required');
    }

    if (!dto.type) {
      throw new BadRequestException('type is required');
    }

    if (!dto.amount) {
      throw new BadRequestException('amount is required');
    }

    if (!dto.cost) {
      throw new BadRequestException('cost is required');
    }

    if (!dto.status) {
      throw new BadRequestException('status is required');
    }

    if (!dto.processedAt) {
      throw new BadRequestException('processedAt is required');
    }

    if (!movement.canTransitionTo(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${movement.status} to ${newStatus}`,
      );
    }

    movement.transitionTo(newStatus, dto.reason ?? undefined);

    if (newStatus === MovementStatus.COMPLETED) {
      await this.applyBalanceEffects(movement);
    }

    await this.movementRepository.save(movement);

    const webhookEvent = new WebhookEvent({
      eventId: dto.eventId,
      movementId: dto.movementId,
      type: dto.type,
      amount: dto.amount,
      cost: dto.cost,
      status: dto.status,
      processedAt: new Date(dto.processedAt),
      reason: dto.reason ?? undefined,
    });
    await this.webhookEventRepository.save(webhookEvent);

    return { message: 'Webhook processed successfully', movement };
  }

  private async applyBalanceEffects(movement: Movement): Promise<void> {
    let walletBalance = await this.walletBalanceRepository.findByWalletId(
      movement.walletId,
    );

    if (!walletBalance) {
      walletBalance = new WalletBalance({ walletId: movement.walletId });
    }

    const fee = this.calculateFee(movement);

    switch (movement.type) {
      case MovementType.DEPOSIT:
        walletBalance.credit(movement.amount);
        break;
      case MovementType.DEBIT:
      case MovementType.FORCE_DEBIT:
        walletBalance.debit(movement.amount);
        break;
    }

    await this.walletBalanceRepository.save(walletBalance);

    const companyBalance = await this.companyBalanceRepository.get();
    companyBalance.addIncome(fee);
    await this.companyBalanceRepository.save(companyBalance);
  }

  private calculateFee(movement: Movement): number {
    switch (movement.type) {
      case MovementType.DEPOSIT:
        return 1;
      case MovementType.DEBIT:
      case MovementType.FORCE_DEBIT:
        return movement.amount * 0.01;
      default:
        return 0;
    }
  }
}
