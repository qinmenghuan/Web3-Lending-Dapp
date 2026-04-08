import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Loan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: true })
  marketAddress: string | null;

  @Column()
  user: string;

  // @Column()
  // token: string;

  @Column()
  type: string; // deposit / withdraw /borrow

  @Column()
  amount: string;

  @Column()
  txHash: string;

  // Date.now() 例如1775180942589 是毫秒级别，所有需要用bigint存储
  @Column('bigint')
  timestamp: number;
}
