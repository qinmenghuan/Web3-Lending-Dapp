import { Injectable } from '@nestjs/common';

@Injectable()
export class MarketService {
  async getMarkets() {
    return [
      {
        asset: 'USDC',
        supplyRate: 5,
        borrowRate: 8,
        liquidity: '1000000',
      },
    ];
  }
}
