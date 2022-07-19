import { ContextFunction } from 'apollo-server-core'
import { Context } from '../types'
import dbPool from './datasources/db-pool'

type ContextParams = { req: Express.Request; res: Express.Response }

export const customContext: ContextFunction<
  ContextParams,
  Omit<Context, 'dataSources'>
> = async (_cxt) => {
  return {
    pool: await dbPool.getPool(),
  }
}

export default customContext
