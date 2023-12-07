import { createServer } from 'net'

export async function freeport (): Promise<number> {
  return await new Promise((resolve, reject) => {
    const server = createServer()
    let port = 0

    server.once('listening', () => {
      const address = server.address()

      if (address == null) {
        return reject(new Error('Server was not listening'))
      }

      if (typeof address === 'string') {
        return reject(new Error('Server was Unix Socket'))
      }

      port = address.port
      server.close()
    })
    server.once('close', () => {
      resolve(port)
    })
    server.once('error', reject)
    server.listen(0, '127.0.0.1')
  })
}
