import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { MarketService } from '../market/market.service';
import { Market } from '../market/market.entity';

@Controller('vaults')
export class VaultController {
  constructor(private service: MarketService) {}

  @Get()
  getVaults() {
    return this.service.getMarkets();
  }

  // @Param('id') 用于提取路径中的 id。
  // ParseIntPipe 非常重要：HTTP 路径参数默认是字符串类型（"1"），这个 Pipe 会自动把它转成数字（1）
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Market> {
    const market = await this.service.findOne(id);

    if (!market) {
      throw new NotFoundException(`Market with ID ${id} not found`);
    }
    return market;
  }
}
