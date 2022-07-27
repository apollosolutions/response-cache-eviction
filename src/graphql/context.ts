import { ContextFunction } from 'apollo-server-core'
import { Context } from '../types'
import dbPool from './datasources/db-pool'
import { RedisEvictor } from './RedisEvictor'

type ContextParams = { req: Express.Request; res: Express.Response }

export const customContext: ContextFunction<
  ContextParams,
  Omit<Context, 'dataSources'>
> = async (_cxt) => {
  return {
    pool: await dbPool.getPool(),
    cacheEvictor: await new RedisEvictor().init(),
  }
}

export default customContext
