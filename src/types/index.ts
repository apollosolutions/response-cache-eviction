import { Pool } from 'pg'
import dsrc from '../graphql/datasources'
import { RedisEvictor } from '../graphql/RedisEvictor'

export type DrugDao = {
  id: number
  brand_name: string
  generic_name: string
  drug_class: string
  schedule: string
  released_on: string
  pills_in_stock?: number
  max_pill_stock_capacity?: number
}

export type Context = {
  pool: Pool
  dataSources: ReturnType<typeof dsrc>
  cacheEvictor?: RedisEvictor
}
