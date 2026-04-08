import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlockchainService } from './blockchain.service';
import {
  getLoanContract,
  getMarketFactoryContract,
  getNewContract,
} from './contract';
import { Loan } from '../loan/loan.entity';
import { Market } from '../market/market.entity';
import ERC20ABI from './ERC20ABI.json';

@Injectable()
export class EventListener implements OnModuleInit {
  constructor(
    private blockchain: BlockchainService,
    @InjectRepository(Loan)
    private loanRepo: Repository<Loan>,
    @InjectRepository(Market)
    private marketRepo: Repository<Market>,
  ) {}

  onModuleInit() {
    this.addLoanContractListener();

    const factoryContract = getMarketFactoryContract(
      this.blockchain.getProvider(),
    );

    factoryContract.on(
      'MarketCreated',
      async (market, collateralToken, loanToken, ltvBps, event) => {
        try {
          console.log(
            `Detected market creation: market=${market} collateralToken=${collateralToken} loanToken=${loanToken} ltvBps=${ltvBps.toString()}`,
          );

          const [collateralTokenName, loanTokenName] = await Promise.all([
            getNewContract(
              this.blockchain.getProvider(),
              collateralToken,
              ERC20ABI,
            ).name() as Promise<string>,
            getNewContract(
              this.blockchain.getProvider(),
              loanToken,
              ERC20ABI,
            ).name() as Promise<string>,
          ]);
          console.log(
            `Fetched token names: collateralTokenName=${collateralTokenName} loanTokenName=${loanTokenName}`,
          );

          const obj = {
            marketAddress: market,
            network: 'ethereum',
            collateralTokenAddress: collateralToken,
            collateralTokenName,
            loanTokenAddress: loanToken,
            loanTokenName,
            totalCollateralAmount: '0',
            totalLoanAmount: '0',
            totalDebtAmount: '0',
            ltvBps: Number(ltvBps),
            txHash: event.log.transactionHash,
            timestamp: Date.now(),
          };
          console.log('Saving new market to database:', obj);

          await this.marketRepo.save(obj);

          this.addLoanContractListener(market);
          // await this.updateMarketData(market);
        } catch (error) {
          console.error('Failed to handle MarketCreated event', error);
        }
      },
    );
  }

  addLoanContractListener(loanContractAddress = process.env.LOAN_CONTRACT!) {
    const contract = getLoanContract(
      this.blockchain.getProvider(),
      loanContractAddress,
    );

    contract.on('Deposited', async (user, amount, event) => {
      console.log(
        `Detected deposit: user=${user}, amount=${amount.toString()}`,
      );
      await this.loanRepo.save({
        marketAddress: loanContractAddress,
        user,
        type: 'deposit',
        amount: amount.toString(),
        txHash: event?.log?.transactionHash,
        timestamp: Date.now(),
      });
      // 更新
      await this.updateMarketData(loanContractAddress);
    });

    contract.on('WithDrawn', async (user, amount, event) => {
      console.log(
        `Detected withdraw: user=${user}, amount=${amount.toString()}`,
      );
      await this.loanRepo.save({
        marketAddress: loanContractAddress,
        user,
        type: 'withdraw',
        amount: amount.toString(),
        txHash: event?.log?.transactionHash,
        timestamp: Date.now(),
      });
      await this.updateMarketData(loanContractAddress);
    });

    contract.on('CollateralSupplied', async (user, amount, event) => {
      console.log(
        `Detected collateral supplied: user=${user}, amount=${amount.toString()}`,
      );
      await this.loanRepo.save({
        marketAddress: loanContractAddress,
        user,
        type: 'collateral_supplied',
        amount: amount.toString(),
        txHash: event?.log?.transactionHash,
        timestamp: Date.now(),
      });
      await this.updateMarketData(loanContractAddress);
    });

    contract.on('CollateralWithdrawn', async (user, amount, event) => {
      console.log(
        `Detected collateral withdrawn: user=${user}, amount=${amount.toString()}`,
      );
      await this.loanRepo.save({
        marketAddress: loanContractAddress,
        user,
        type: 'collateral_withdrawn',
        amount: amount.toString(),
        txHash: event?.log?.transactionHash,
        timestamp: Date.now(),
      });
      await this.updateMarketData(loanContractAddress);
    });

    contract.on('Borrowed', async (user, amount, event) => {
      console.log(`Detected borrow: user=${user}, amount=${amount.toString()}`);
      await this.loanRepo.save({
        marketAddress: loanContractAddress,
        user,
        type: 'borrowed',
        amount: amount.toString(),
        txHash: event?.log?.transactionHash,
        timestamp: Date.now(),
      });
      await this.updateMarketData(loanContractAddress);
    });

    contract.on('Repaid', async (user, amount, event) => {
      console.log(`Detected repay: user=${user}, amount=${amount.toString()}`);
      await this.loanRepo.save({
        marketAddress: loanContractAddress,
        user,
        type: 'repaid',
        amount: amount.toString(),
        txHash: event?.log?.transactionHash,
        timestamp: Date.now(),
      });
      await this.updateMarketData(loanContractAddress);
    });
  }

  // 更新市场合约相关数据
  async updateMarketData(marketAddress: string) {
    const contract = getLoanContract(
      this.blockchain.getProvider(),
      marketAddress,
    );
    // 根据地址查市场对象
    const market = await this.marketRepo.findOneBy({ marketAddress });

    console.log(`Updating market data for ${market?.id || marketAddress}...`);

    if (!market) {
      return;
    }

    const stats = (await contract.stats()) as {
      totalDeposits: bigint;
      totalCollateral: bigint;
      totalDebt: bigint;
    };

    console.log(
      `Updating market data for ${marketAddress}: totalDeposits=${stats.totalDeposits.toString()} totalCollateral=${stats.totalCollateral.toString()} totalDebt=${stats.totalDebt.toString()}`,
    );

    await this.marketRepo.update(
      { id: market.id },
      {
        totalLoanAmount: stats.totalDeposits.toString(),
        totalCollateralAmount: stats.totalCollateral.toString(),
        totalDebtAmount: stats.totalDebt.toString(),
        timestamp: Date.now(),
      },
    );
  }
}
