import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CreateMovementDto } from '../application/dto/create-movement.dto.js';
import { WebhookEventDto } from '../application/dto/webhook-event.dto.js';
import { CreateMovementUseCase } from '../application/use-cases/create-movement.use-case.js';
import { GetCompanyBalanceUseCase } from '../application/use-cases/get-company-balance.use-case.js';
import { GetMovementUseCase } from '../application/use-cases/get-movement.use-case.js';
import { GetMovementsByWalletIdUseCase } from '../application/use-cases/get-movements-by-wallet-id.use-case.js';
import { GetWalletBalanceUseCase } from '../application/use-cases/get-wallet-balance.use-case.js';
import { ProcessWebhookUseCase } from '../application/use-cases/process-webhook.use-case.js';

@ApiTags('Wallet')
@Controller()
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class WalletController {
  constructor(
    private readonly createMovement: CreateMovementUseCase,
    private readonly processWebhook: ProcessWebhookUseCase,
    private readonly getMovement: GetMovementUseCase,
    private readonly getWalletBalance: GetWalletBalanceUseCase,
    private readonly getCompanyBalance: GetCompanyBalanceUseCase,
    private readonly getMovementsByWalletId: GetMovementsByWalletIdUseCase,
  ) {}

  @Post('wallet-movements')
  @ApiOperation({ summary: 'Create a new wallet movement' })
  async create(@Body() dto: CreateMovementDto) {
    const movement = await this.createMovement.execute(dto);
    return { message: 'Movement created successfully', movement };
  }

  @Post('wallet-movements/webhook')
  @HttpCode(200)
  @ApiOperation({ summary: 'Process a movement webhook event' })
  async webhook(@Body() dto: WebhookEventDto) {
    return this.processWebhook.execute(dto);
  }

  @Get('wallet-movements/:id')
  @ApiOperation({ summary: 'Find a movement by ID' })
  @ApiParam({ name: 'id', description: 'The movement ID' })
  async findMovement(@Param('id') id: string) {
    return this.getMovement.execute(id);
  }

  @Get('wallet-balances/:walletId')
  @ApiOperation({ summary: 'Find wallet balance by wallet ID' })
  @ApiParam({ name: 'walletId', description: 'The wallet ID' })
  async findBalance(@Param('walletId') walletId: string) {
    return this.getWalletBalance.execute(walletId);
  }

  @Get('wallet-movements/wallet/:walletId')
  @ApiOperation({ summary: 'Find all movements by wallet ID' })
  @ApiParam({ name: 'walletId', description: 'The wallet ID' })
  async findMovements(@Param('walletId') walletId: string) {
    return this.getMovementsByWalletId.execute(walletId);
  }

  @Get('company-balance')
  @ApiOperation({ summary: 'Get total company balance from fees' })
  async findCompanyBalance() {
    return this.getCompanyBalance.execute();
  }
}
