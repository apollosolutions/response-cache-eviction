import { Pool } from 'pg'
import db from './db-pool'
import { DataSource } from 'apollo-datasource'
import { DrugDao } from '../../types'
import { AllDrugsFilter } from '../../types/generated/graphql'

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
    await sleep(1_000) // artificial timeout to demonstrate cache hits
    return (
      await (await this.pool).query('select * from drug where id = $1', [id])
    ).rows[0]
  }

  async getDrugs(): Promise<DrugDao[]> {
    const query = `
SELECT d.*, di.pills_in_stock, di.max_pill_stock_capacity FROM drug d
LEFT JOIN drug_inventory di
ON di.drug_id = d.id
`
    return (await (await this.pool).query(query)).rows
  }

  async getDrugsBySchedule(
    schedules: AllDrugsFilter['schedules'],
  ): Promise<DrugDao[]> {
    const uniqueSchedules = [...new Set(schedules)]

    const placeHolders = uniqueSchedules
      .map((_it, idx) => `$${idx + 1}`)
      .join(',')

    const query = `
SELECT d.*, di.pills_in_stock, di.max_pill_stock_capacity FROM drug d
LEFT JOIN drug_inventory di
ON di.drug_id = d.id
WHERE d.schedule in (${placeHolders})
`

    const res = await (await this.pool).query(query, uniqueSchedules)
    return res.rows
  }

  async setPillCountForDrug(drugId: number, pillCount: number) {
    const query = `
    INSERT INTO drug_inventory(drug_id, pills_in_stock)
    VALUES ($1, $2)
    ON CONFLICT(drug_id)
    DO UPDATE SET pills_in_stock = EXCLUDED.pills_in_stock
    RETURNING id, drug_id, pills_in_stock
    `

    return (await (await this.pool).query(query, [drugId, pillCount])).rows
  }
}
