import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { LoanService } from './loan.service';
import { Loan } from './loan.entity';

@Controller('loans')
export class LoanController {
  constructor(private service: LoanService) {}

  @Get()
  getMarkets(@Query('id') market: string) {
    return this.service.getLoans(market);
  }
}
