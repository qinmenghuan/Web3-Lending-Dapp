import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Loan } from './loan.entity';

@Injectable()
export class LoanService {
  constructor(
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>, // 注入 Repository
  ) {}

  // 获取所有的借贷记录
  async getLoans(marketAddress: string): Promise<Loan[]> {
    // TODO: 要做分页，目前根据market返回所有
    return await this.loanRepository.findBy({
      marketAddress,
    });
  }
}
