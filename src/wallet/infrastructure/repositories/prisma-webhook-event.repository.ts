import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma.service.js';
import { WebhookEvent } from '../../domain/entities/webhook-event.entity.js';
import { WebhookEventRepository } from '../../domain/repositories/webhook-event.repository.js';

@Injectable()
export class PrismaWebhookEventRepository extends WebhookEventRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async save(event: WebhookEvent): Promise<WebhookEvent> {
    const record = await this.prisma.webhookEvent.create({
      data: {
        eventId: event.eventId,
        movementId: event.movementId,
        type: event.type,
        amount: event.amount,
        cost: event.cost,
        status: event.status,
        processedAt: event.processedAt,
        reason: event.reason ?? null,
      },
    });

    return this.toDomain(record);
  }

  async findByEventId(eventId: string): Promise<WebhookEvent | null> {
    const record = await this.prisma.webhookEvent.findUnique({
      where: { eventId },
    });
    return record ? this.toDomain(record) : null;
  }

  private toDomain(record: any): WebhookEvent {
    return new WebhookEvent({
      eventId: record.eventId,
      movementId: record.movementId,
      type: record.type,
      amount: record.amount,
      cost: record.cost,
      status: record.status,
      processedAt: record.processedAt,
      reason: record.reason ?? undefined,
    });
  }
}
