import { Pool } from 'pg'
import db from './db-pool'
import { DataSource } from 'apollo-datasource'
import { DrugDao } from '../../types'

const sleep = async (duration: number = 1000) => {
  return new Promise((resolve) => {
    setTimeout(resolve, duration)
  })
}

export class DrugAPI extends DataSource {
  private pool: Promise<Pool>

  constructor() {
    super()
    this.pool = db.getPool()
  }

  async getDrugById(id: number): Promise<DrugDao> {
    const query = `select * from drug where id = ${id}` // Don't do this in production, you'll want to fully sanitize all client inputs.
    await sleep(1_000) // artificial timeout to demonstrate cache hits
    return (await (await this.pool).query(query)).rows[0]
  }

  async getDrugs(): Promise<DrugDao[]> {
    return (await (await this.pool).query(`select * from drug limit 200`)).rows
  }
}
