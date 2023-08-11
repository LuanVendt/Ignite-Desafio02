// import { knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    diet: {
      id: string
      name: string
      date: Date
      onTheDiet: sring
      session_id?: string
    }
  }
}
