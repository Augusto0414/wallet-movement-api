import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { MovementStatus } from '../../domain/enums/movement-status.enum.js';
import { MovementType } from '../../domain/enums/movement-type.enum.js';

export class CreateMovementDto {
  @ApiProperty({ description: 'The unique identifier for the movement', example: 'mov-123' })
  @IsString()
  @IsNotEmpty()
  id?: string;

  @ApiProperty({ description: 'The ID of the user performing the movement', example: 'usr-001' })
  @IsString()
  @IsNotEmpty()
  userId?: string;

  @ApiProperty({ description: 'The ID of the wallet where the movement is performed', example: 'wal-001' })
  @IsString()
  @IsNotEmpty()
  walletId?: string;

  @ApiProperty({ enum: MovementType, description: 'The type of movement: DEPOSIT or DEBIT' })
  @IsEnum(MovementType)
  type?: MovementType;

  @ApiProperty({ description: 'The amount of the movement', example: 100.0 })
  @IsNumber()
  @Min(0.01)
  amount?: number;

  @ApiProperty({ description: 'The cost/fee associated with the movement', example: 1.0 })
  @IsNumber()
  @Min(0)
  cost?: number;

  @ApiProperty({ enum: MovementStatus, description: 'The initial status (should be CREATED)', example: MovementStatus.CREATED })
  @IsEnum(MovementStatus)
  status?: MovementStatus;
}
