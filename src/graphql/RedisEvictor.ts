import { createClient, RedisClientType } from 'redis'
import config from '../config'

export class RedisEvictor {
  constructor(
    private client?: RedisClientType,
    private namespace: string = config.cacheNamespace,
  ) {}

  async init() {
    if (this.client) return this
    await this.getRedisClient()
    return this
  }

  async getRedisClient() {
    if (this.client) return this.client
    this.client = createClient({ url: config.redisUrl })
    await this.client.connect()
    return this.client
  }

  async deleteByPrefixes(...prefixes: string[]) {
    return (await Promise.all(prefixes.map(this.deleteByPrefix, this))).flatMap(
      (x) => x,
    )
  }

  async deleteByPrefix(prefix: string) {
    const scanIterator = this.client.scanIterator({
      MATCH: `${this.namespace}:fqc:${prefix}*`,
    })

    let keys = []

    for await (const key of scanIterator) {
      keys.push(key)
    }

    if (keys.length > 0) {
      await this.client.del(keys) // This is blocking, consider handling async in productoin if the number of keys is large
    }

    return keys
  }
}
