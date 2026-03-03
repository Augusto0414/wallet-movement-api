import { WebhookEvent } from '../../src/wallet/domain/entities/webhook-event.entity.js';
import { WebhookEventRepository } from '../../src/wallet/domain/repositories/webhook-event.repository.js';

export class InMemoryWebhookEventRepository extends WebhookEventRepository {
  private readonly events = new Map<string, WebhookEvent>();

  save(event: WebhookEvent): Promise<WebhookEvent> {
    this.events.set(event.eventId, event);
    return Promise.resolve(event);
  }

  findByEventId(eventId: string): Promise<WebhookEvent | null> {
    return Promise.resolve(this.events.get(eventId) ?? null);
  }
}
