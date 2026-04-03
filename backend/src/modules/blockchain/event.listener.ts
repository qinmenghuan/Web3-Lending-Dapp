import { Injectable, OnModuleInit } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { getLoanContract } from './contract';
import { Repository } from 'typeorm';
import { Loan } from '../loan/loan.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class EventListener implements OnModuleInit {
  constructor(
    private blockchain: BlockchainService,
    @InjectRepository(Loan)
    private loanRepo: Repository<Loan>,
  ) {}

  onModuleInit() {
    const contract = getLoanContract(this.blockchain.getProvider());
    contract.on('Deposited', async (user, amount, event) => {
      console.log(
        `Detected deposit: user=${user}, amount=${amount.toString()}`,
      );
      await this.loanRepo.save({
        user,
        // token:"collateral",
        type: 'deposit',
        amount: amount.toString(),
        txHash: event?.log?.transactionHash,
        timestamp: Date.now(),
      });
    });
  }
}
