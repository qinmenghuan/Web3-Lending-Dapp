import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private client = new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  });

  async get(key: string) {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttl = 30) {
    return this.client.set(key, value, 'EX', ttl);
  }

  async del(key: string) {
    return this.client.del(key);
  }
}
