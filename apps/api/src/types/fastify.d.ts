import 'fastify'

declare module 'fastify' {
  interface FastifyRequest {
    admin?: {
      username: string
      createdAt: number
    }
  }
}

