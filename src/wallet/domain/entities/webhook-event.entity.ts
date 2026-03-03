export class WebhookEvent {
  public readonly eventId: string;
  public readonly movementId: string;
  public readonly type: string;
  public readonly amount: number;
  public readonly cost: number;
  public readonly status: string;
  public readonly processedAt: Date;
  public readonly reason?: string;

  constructor(params: {
    eventId: string;
    movementId: string;
    type: string;
    amount: number;
    cost: number;
    status: string;
    processedAt: Date;
    reason?: string;
  }) {
    this.eventId = params.eventId;
    this.movementId = params.movementId;
    this.type = params.type;
    this.amount = params.amount;
    this.cost = params.cost;
    this.status = params.status;
    this.processedAt = params.processedAt;
    this.reason = params.reason;
  }
}
