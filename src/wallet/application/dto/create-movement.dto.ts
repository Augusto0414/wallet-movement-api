import { IsEnum, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { MovementStatus } from '../../domain/enums/movement-status.enum.js';
import { MovementType } from '../../domain/enums/movement-type.enum.js';

export class CreateMovementDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  walletId: string;

  @IsEnum(MovementType)
  type: MovementType;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsNumber()
  @Min(0)
  cost: number;

  @IsEnum(MovementStatus)
  status: MovementStatus;
}
