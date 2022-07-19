import { Pool } from 'pg'
import config from '../../config'
let pool: Pool

export default {
  getPool: async () => {
    if (pool) return pool
    pool = new Pool(config.postgresConfig)
    return pool
  },
}
