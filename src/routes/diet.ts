import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import crypto, { randomUUID } from 'node:crypto'
// import { request } from 'node:https'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

// Cookies <-> Formas de a gente manter contexto entre requisições

export async function dietRoutes(app: FastifyInstance) {
  app.addHook('preHandler', async (request) => {
    console.log(`[${request.method}] ${request.url} `)
  })

  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies
      const diet = await knex('diet').where('session_id', sessionId).select()

      return {
        diet,
      }
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies
      const getDietParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getDietParamsSchema.parse(request.params)

      const diet = await knex('diet')
        .where({
          session_id: sessionId,
          id,
        })
        .first()

      return { diet }
    },
  )

  app.get(
    '/summary',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies
      const summary = await knex('diet').where('session_id', sessionId)

      const getDietParamsSchema = z.object({
        id: z.string().uuid(),
      })

      return { summary }
    },
  )

  app.put(
    '/update/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const getDietParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getDietParamsSchema.parse(request.params)

      const updateDietBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        date: z.string(),
        onTheDiet: z.enum(['Y', 'N']),
      })

      const { name, description, date, onTheDiet } = updateDietBodySchema.parse(
        request.body,
      )

      const sessionId = request.cookies.sessionId

      const diet = await knex('diet')
        .where({
          session_id: sessionId,
          id,
        })
        .update({
          name,
          description,
          date,
          onTheDiet,
        })
    },
  )

  app.delete('/delete/:id', async (request, reply) => {
    const createDietBodySchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = createDietBodySchema.parse(request.params)

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
    }

    const diet = await knex('diet')
      .where({
        session_id: sessionId,
        id,
      })
      .delete(sessionId)
  })

  app.post('/', async (request, reply) => {
    const createDietBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      onTheDiet: z.enum(['Y', 'N']),
    })

    const { name, description, onTheDiet } = createDietBodySchema.parse(
      request.body,
    )

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
    }

    await knex('diet').insert({
      id: crypto.randomUUID(),
      name,
      description,
      onTheDiet,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })
}
