import { Pool } from 'pg'

const pool = new Pool({
  host: process.env.PG_HOST,
  port: parseInt(process.env.PG_PORT || '5432'),
  database: process.env.PG_DB,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  // SSL 비활성화 - 서버가 지원하지 않음
  ssl: false,
})

export default pool
