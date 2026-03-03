import { Module } from '@nestjs/common';
import { SharedModule } from './shared/shared.module.js';
import { WalletModule } from './wallet/wallet.module.js';

@Module({
  imports: [SharedModule, WalletModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
