import { it, beforeAll, afterAll, describe, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import { execSync } from 'node:child_process'

describe('diet routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npx knex migrate:rollback --all')
    execSync('npx knex migrate:latest')
  })

  it('should be able to create a new diet', async () => {
    await request(app.server)
      .post('/diet')
      .send({
        name: 'New diet',
        description: 'arroz e feijao',
        dateTime: new Date(),
        onTheDiet: 'Y',
      })
      .expect(201)
  })

  it('should be able to list all diet', async () => {
    const createDietResponse = await request(app.server).post('/diet').send({
      name: 'New diet',
      description: 'arroz e feijao',
      dateTime: new Date(),
      onTheDiet: 'Y',
    })

    const cookies = createDietResponse.get('Set-Cookie')

    const listDietResponse = await request(app.server)
      .get('/diet')
      .set('Cookie', cookies)
      .expect(200)

    expect(listDietResponse.body.diet).toEqual([
      expect.objectContaining({
        name: 'New diet',
        description: 'arroz e feijao',
      }),
    ])
  })

  it('should be able to get a specific diet', async () => {
    const createDietResponse = await request(app.server).post('/diet').send({
      name: 'New diet',
      description: 'arroz e feijao',
      dateTime: new Date(),
      onTheDiet: 'Y',
    })

    const cookies = createDietResponse.get('Set-Cookie')

    const listDietResponse = await request(app.server)
      .get('/diet')
      .set('Cookie', cookies)
      .expect(200)

    const dietId = listDietResponse.body.diet[0].id

    const getDietResponse = await request(app.server)
      .get(`/diet/${dietId}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(getDietResponse.body.diet).toEqual(
      expect.objectContaining({
        name: 'New diet',
        description: 'arroz e feijao',
        dateTime: new Date(),
        onTheDiet: 'Y',
      }),
    )
  })

  it('should be able to get the summary', async () => {
    const createDietResponse = await request(app.server).post('/diet').send({
      name: 'New diet',
      description: 'arroz e feijao',
      // dateTime: new Date(),
      onTheDiet: 'Y',
    })

    const cookies = createDietResponse.get('set-cookie')

    await request(app.server).post('/diet').set('Cookie', cookies).send({
      name: 'New diet',
      description: 'arroz e feijao',
      // dateTime: new Date(),
      onTheDiet: 'Y',
    })

    // const summaryResponse = await request(app.server)
    //   .get('/diet/summary')
    //   .set('Cookie', cookies)
    //   .expect(200)

    // expect(summaryResponse.body.summary).toEqual({""
    //   amount: 3000,
  })

  it('should be able to update the meal', async () => {
    const createDietResponse = await request(app.server).post('/update').send({
      name: 'New diet',
      description: 'arroz e feijao',
      dateTime: new Date(),
      onTheDiet: 'Y',
    })

    const cookies = createDietResponse.get('set-cookie')

    await request(app.server).put('/update').set('Cookie', cookies).send({
      name: 'New diet',
      description: 'arroz e feijao',
      dateTime: new Date(),
      onTheDiet: 'Y',
    })
  })
})
