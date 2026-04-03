import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Loan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user: string;

  // @Column()
  // token: string;

  @Column()
  type: string; // deposit / borrow

  @Column()
  amount: string;

  @Column()
  txHash: string;

  @Column('bigint')
  timestamp: number;
}
