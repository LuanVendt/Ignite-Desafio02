import { app } from './app'
import { env } from './env'

app
  .listen({
    host: '0.0.0.0',
    port: env.PORT,
  })
  .then(() => {
    console.log(`HTTP server running: ${env.PORT}`)
  })
  .catch((error) => {
    console.error('Error while starting the server:', error)
  })
