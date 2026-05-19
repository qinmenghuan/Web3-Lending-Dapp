import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VaultController } from './vault.controller';
import { MarketModule } from '../market/market.module';

@Module({
  // 注册repository 需要告诉nest这个模块需要用到market这个实体
  imports: [MarketModule],
  controllers: [VaultController],
})
export class VaultModule {}
