import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Market {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: true })
  marketAddress: string | null;

  @Column()
  network: string;

  @Column()
  collateralTokenAddress: string;

  @Column()
  collateralTokenName: string;

  @Column()
  loanTokenAddress: string;

  @Column()
  loanTokenName: string;

  @Column()
  totalCollateralAmount: string;

  @Column()
  totalLoanAmount: string;

  @Column()
  totalDebtAmount: string;

  @Column('bigint')
  ltvBps: number;

  @Column()
  txHash: string;

  @Column('bigint')
  timestamp: number;
}
