import { WebhookEvent } from '../entities/webhook-event.entity.js';

export abstract class WebhookEventRepository {
  abstract save(event: WebhookEvent): Promise<WebhookEvent>;
  abstract findByEventId(eventId: string): Promise<WebhookEvent | null>;
}
