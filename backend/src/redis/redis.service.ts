import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Redis } from '@upstash/redis';

@Injectable()
export class RedisService implements OnModuleInit {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;

  onModuleInit() {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (url && token) {
      this.client = new Redis({ url, token });
      this.logger.log('Redis client initialized');
    } else {
      this.logger.warn('Redis credentials not configured — caching disabled');
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.client) return null;
    try {
      return await this.client.get<T>(key);
    } catch (err) {
      this.logger.warn(`Redis GET failed for "${key}" — falling back to source: ${err}`);
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    if (!this.client) return;
    try {
      await this.client.set(key, value, { ex: ttlSeconds });
    } catch (err) {
      this.logger.warn(`Redis SET failed for "${key}" — cache skipped: ${err}`);
    }
  }

  async del(...keys: string[]): Promise<void> {
    if (!this.client || keys.length === 0) return;
    try {
      await this.client.del(...keys);
    } catch (err) {
      this.logger.warn(`Redis DEL failed (${keys.length} keys) — TTL applies: ${err}`);
    }
  }

  async invalidateByPrefix(prefix: string): Promise<void> {
    if (!this.client) return;
    const client = this.client;

    const scanAndDelete = async (cur: number): Promise<number> => {
      const [nextCursor, keys] = await client.scan(cur, {
        match: `${prefix}*`,
        count: 1000,
      });
      if (keys.length > 0) {
        await client.del(...keys);
        this.logger.log(`Invalidated ${keys.length} keys with prefix "${prefix}"`);
      }
      return Number(nextCursor);
    };

    try {
      let cursor = await scanAndDelete(0);
      while (cursor !== 0) {
        cursor = await scanAndDelete(cursor);
      }
    } catch (err) {
      this.logger.warn(`Redis invalidateByPrefix failed for "${prefix}*" — TTL applies: ${err}`);
    }
  }

  async ping(): Promise<string> {
    if (!this.client) return 'DISABLED';
    try {
      return await this.client.ping();
    } catch (err) {
      this.logger.warn(`Redis PING failed: ${err}`);
      return 'ERROR';
    }
  }
}
