import { Pool } from 'pg'
import dsrc from '../graphql/datasources'

export type DrugDao = {
  id: number
  brand_name: string
  generic_name: string
  drug_class: string
  schedule: string
  released_on: string
}

export type Context = {
  pool: Pool
  dataSources: ReturnType<typeof dsrc>
}
