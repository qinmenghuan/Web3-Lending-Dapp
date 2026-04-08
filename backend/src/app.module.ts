// 从 NestJS 公共包中导入 Module 装饰器，用来声明应用模块。
import { Module } from '@nestjs/common';
// 导入 TypeORM 的 NestJS 集成模块，用来注册数据库连接。
import { TypeOrmModule } from '@nestjs/typeorm';
// 导入配置模块和配置服务，用于加载并读取 .env 中的环境变量。
import { ConfigModule, ConfigService } from '@nestjs/config';
// 导入 Node.js 的 path 工具，用于安全拼接 .env 文件路径。
import { join } from 'path';
// 导入应用控制器，负责处理根路由或基础 HTTP 请求。
import { AppController } from './app.controller';
// 导入应用服务，给控制器提供基础业务能力。
import { AppService } from './app.service';

// redis 和postgresql的配置
// 导入 Redis 模块，用于统一注册缓存或 Redis 相关服务。
import { RedisModule } from './common/redis/redis.module';

// 引入业务module
// 导入市场业务模块，负责市场相关接口和服务。
import { MarketModule } from './modules/market/market.module';
// 这里保留了 LoanModule 的导入语句，但当前仍然注释掉，表示暂未启用该模块。
import { LoanModule } from './modules/loan/loan.module';
// 导入区块链业务模块，负责链上事件监听、合约交互等能力。
import { BlockchainModule } from './modules/blockchain/blockchain.module';
// 导入 Loan 实体，供 TypeORM 注册实体映射时使用。
import { Loan } from './modules/loan/loan.entity';
import { Market } from './modules/market/market.entity';

// 使用 @Module 装饰器声明当前类是 NestJS 的根模块。
@Module({
  // imports 用于注册当前模块依赖的其他模块。
  imports: [
    // 加载环境变量配置，并将配置模块设置为全局模块。
    ConfigModule.forRoot({
      // isGlobal: true 表示其他模块无需重复导入 ConfigModule 也能使用配置能力。
      isGlobal: true,
      // 显式指定 .env 文件路径，避免因启动目录不同导致读取不到环境变量。
      envFilePath: join(__dirname, '..', '.env'),
    }),
    // postgresql的配置
    // 异步初始化 TypeORM，确保数据库配置在 ConfigModule 加载后再读取。
    TypeOrmModule.forRootAsync({
      // 声明工厂函数依赖 ConfigService，由 Nest 注入。
      inject: [ConfigService],
      // useFactory 返回 TypeORM 运行时配置对象。
      useFactory: (configService: ConfigService) => ({
        // 指定当前数据库类型为 PostgreSQL。
        type: 'postgres',
        // 从环境变量中读取 PostgreSQL 主机地址。
        host: configService.get<string>('POSTGRES_HOST'),
        // 从环境变量中读取端口，并转换为数字类型。
        port: Number(configService.get<string>('POSTGRES_PORT')),
        // 从环境变量中读取数据库用户名。
        username: configService.get<string>('POSTGRES_USER'),
        // 从环境变量中读取数据库密码。
        password: configService.get<string>('POSTGRES_PASSWORD'),
        // 从环境变量中读取数据库名。
        database: configService.get<string>('POSTGRES_DB'),
        // 注册当前项目中需要映射到数据库表的实体类。
        entities: [Loan, Market],
        // 自动同步实体到数据库结构，适合开发环境，生产环境通常不建议开启。
        synchronize: true,
      }),
    }),
    // 注册 Redis 模块。
    RedisModule,
    // 注册市场业务模块。
    MarketModule,
    // 注册借贷业务模块
    LoanModule,
    // 注册区块链业务模块。
    BlockchainModule,
  ],
  // controllers 用于声明当前模块中可处理请求的控制器。
  controllers: [AppController],
  // providers 用于声明当前模块中的服务提供者。
  providers: [AppService],
})
// 导出应用根模块，作为 Nest 应用启动入口的模块定义。
export class AppModule {}
