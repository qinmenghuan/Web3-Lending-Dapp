import { Module } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { EventListener } from './event.listener';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Loan } from '../loan/loan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Loan])],
  providers: [BlockchainService, EventListener],
  exports: [BlockchainService],
})
export class BlockchainModule {}
