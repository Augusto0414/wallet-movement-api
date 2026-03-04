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
import { CreateMovementDto } from '../application/dto/create-movement.dto.js';
import { WebhookEventDto } from '../application/dto/webhook-event.dto.js';
import { CreateMovementUseCase } from '../application/use-cases/create-movement.use-case.js';
import { GetCompanyBalanceUseCase } from '../application/use-cases/get-company-balance.use-case.js';
import { GetMovementUseCase } from '../application/use-cases/get-movement.use-case.js';
import { GetMovementsByWalletIdUseCase } from '../application/use-cases/get-movements-by-wallet-id.use-case.js';
import { GetWalletBalanceUseCase } from '../application/use-cases/get-wallet-balance.use-case.js';
import { ProcessWebhookUseCase } from '../application/use-cases/process-webhook.use-case.js';

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
  async create(@Body() dto: CreateMovementDto) {
    const movement = await this.createMovement.execute(dto);
    return { message: 'Movement created successfully', movement };
  }

  @Post('wallet-movements/webhook')
  @HttpCode(200)
  async webhook(@Body() dto: WebhookEventDto) {
    return this.processWebhook.execute(dto);
  }

  @Get('wallet-movements/:id')
  async findMovement(@Param('id') id: string) {
    return this.getMovement.execute(id);
  }

  @Get('wallet-balances/:walletId')
  async findBalance(@Param('walletId') walletId: string) {
    return this.getWalletBalance.execute(walletId);
  }

  @Get('wallet-movements/wallet/:walletId')
  async findMovements(@Param('walletId') walletId: string) {
    return this.getMovementsByWalletId.execute(walletId);
  }

  @Get('company-balance')
  async findCompanyBalance() {
    return this.getCompanyBalance.execute();
  }
}
