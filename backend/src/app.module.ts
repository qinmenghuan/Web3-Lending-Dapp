import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// redis 和postgresql的配置
import { RedisModule } from './common/redis/redis.module';

// 引入业务module
import { MarketModule } from './modules/market/market.module';
// import { LoanModule } from './modules/loan/loan.module';
import { BlockchainModule } from './modules/blockchain/blockchain.module';
import { Loan } from './modules/loan/loan.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(__dirname, '..', '.env'),
    }),
    // postgresql的配置
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('POSTGRES_HOST'),
        port: Number(configService.get<string>('POSTGRES_PORT')),
        username: configService.get<string>('POSTGRES_USER'),
        password: configService.get<string>('POSTGRES_PASSWORD'),
        database: configService.get<string>('POSTGRES_DB'),
        entities: [Loan],
        synchronize: true,
      }),
    }),
    RedisModule,
    MarketModule,
    // LoanModule,
    BlockchainModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
