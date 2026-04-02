import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';

// redis 和postgresql的配置
import { RedisModule } from './common/redis/redis.module';
import { typeOrmConfig } from './common/database/typeorm.config';

// 引入业务module
import { MarketModule } from './modules/market/market.module';
// import { LoanModule } from './modules/loan/loan.module';
import { BlockchainModule } from './modules/blockchain/blockchain.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // postgresql的配置
    TypeOrmModule.forRoot(typeOrmConfig),
    RedisModule,
    MarketModule,
    // LoanModule,
    BlockchainModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
