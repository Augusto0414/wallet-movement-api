import { Injectable } from '@nestjs/common';
import { WebhookEvent } from '../../domain/entities/webhook-event.entity.js';
import { WebhookEventRepository } from '../../domain/repositories/webhook-event.repository.js';

@Injectable()
export class InMemoryWebhookEventRepository extends WebhookEventRepository {
  private readonly events = new Map<string, WebhookEvent>();

  async save(event: WebhookEvent): Promise<WebhookEvent> {
    this.events.set(event.eventId, event);
    return event;
  }

  async findByEventId(eventId: string): Promise<WebhookEvent | null> {
    return this.events.get(eventId) ?? null;
  }
}
