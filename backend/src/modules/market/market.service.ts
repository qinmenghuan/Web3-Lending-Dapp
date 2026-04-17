import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Market } from './market.entity';
import { ResponseMarketDto } from './dto/response-market.dto';
import { resolveObjectURL } from 'buffer';
import { formatEther } from 'ethers';

@Injectable()
export class MarketService {
  constructor(
    @InjectRepository(Market)
    private readonly marketRepository: Repository<Market>, // 注入 Repository
  ) {}

  // 获取所有的市场
  async getMarkets(): Promise<ResponseMarketDto[]> {
    const markets = await this.marketRepository.find();
    return markets.map((market) => {
      const utilizationDesc =
        market.totalLoanAmount !== '0'
          ? `${(BigInt(market.totalDebtAmount) * 100n) / BigInt(market.totalLoanAmount)}%`
          : '0%';
      return {
        ...market,
        lltvDesc: `${(market.ltvBps / 10000) * 100}%`,
        totalLoanAmountDesc: formatEther(BigInt(market.totalLoanAmount)), // 转成字符串类型，避免前端精度问题
        totalLiquidityDesc: formatEther(
          BigInt(market.totalLoanAmount) - BigInt(market.totalDebtAmount),
        ), // 可选字段，表示市场的总流动性
        utilizationDesc: utilizationDesc,
      };
    });
  }

  async findOne(id: number): Promise<Market | null> {
    return await this.marketRepository.findOneBy({ id });
  }
}
