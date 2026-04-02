import { Controller, Get } from '@nestjs/common';
import { MarketService } from './market.service';

@Controller('markets')
export class MarketController {
  constructor(private service: MarketService) {}

  @Get()
  getMarkets() {
    return this.service.getMarkets();
  }
}
