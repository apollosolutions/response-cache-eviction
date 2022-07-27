export default {
  cacheNamespace: process.env.CACHE_NAMESPACE || 'drug-graph',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  port: process.env.AS_PORT ? parseInt(process.env.AS_PORT) : 5252,
  postgresConfig: {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || '127.0.0.1',
    database: process.env.DB_DATABASE || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
  },
}
