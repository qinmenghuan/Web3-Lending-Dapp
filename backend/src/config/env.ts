import { TypeOrmModule } from '@nestjs/typeorm';
// import { RedisModule } from '@nestjs-modules/ioredis';

TypeOrmModule.forRoot({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: 5432,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  autoLoadEntities: true,
  synchronize: true, // demo用，生产环境不要开
});

// RedisModule.forRoot({
//   config: {
//     host: process.env.REDIS_HOST,
//     port: 6379,
//   },
// });
