import { MovementStatus } from '../enums/movement-status.enum.js';
import { MovementType } from '../enums/movement-type.enum.js';

export class Movement {
  public readonly id: string;
  public readonly userId: string;
  public readonly walletId: string;
  public readonly type: MovementType;
  public readonly amount: number;
  public readonly cost: number;
  public status: MovementStatus;
  public reason?: string;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(params: {
    id: string;
    userId: string;
    walletId: string;
    type: MovementType;
    amount: number;
    cost: number;
    status: MovementStatus;
    reason?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = params.id;
    this.userId = params.userId;
    this.walletId = params.walletId;
    this.type = params.type;
    this.amount = params.amount;
    this.cost = params.cost;
    this.status = params.status;
    this.reason = params.reason;
    this.createdAt = params.createdAt ?? new Date();
    this.updatedAt = params.updatedAt ?? new Date();
  }

  private static readonly VALID_TRANSITIONS: Record<
    MovementStatus,
    MovementStatus[]
  > = {
    [MovementStatus.CREATED]: [MovementStatus.COMPLETED, MovementStatus.FAILED],
    [MovementStatus.COMPLETED]: [],
    [MovementStatus.FAILED]: [],
  };

  canTransitionTo(newStatus: MovementStatus): boolean {
    return Movement.VALID_TRANSITIONS[this.status].includes(newStatus);
  }

  transitionTo(newStatus: MovementStatus, reason?: string): void {
    if (!this.canTransitionTo(newStatus)) {
      throw new Error(
        `Invalid status transition from ${this.status} to ${newStatus}`,
      );
    }
    this.status = newStatus;
    this.reason = reason;
    this.updatedAt = new Date();
  }
}
