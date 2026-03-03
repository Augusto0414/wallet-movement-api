import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { MovementStatus } from '../../domain/enums/movement-status.enum.js';
import { MovementType } from '../../domain/enums/movement-type.enum.js';

export class WebhookEventDto {
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @IsString()
  @IsNotEmpty()
  movementId: string;

  @IsEnum(MovementType)
  type: MovementType;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsNumber()
  @Min(0)
  cost: number;

  @IsEnum(MovementStatus)
  status: MovementStatus;

  @IsDateString()
  processedAt: string;

  @IsOptional()
  @IsString()
  reason?: string | null;
}
