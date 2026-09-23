import { Server } from 'socket.io'

declare global {
  // eslint-disable-next-line no-var
  var __pathwise_io__: Server | undefined
}

export function getIO(): Server {
  if (global.__pathwise_io__) return global.__pathwise_io__ as Server
  try {
    const instance = new Server(3001, { cors: { origin: '*' } })
    global.__pathwise_io__ = instance
    return instance
  } catch {
    return global.__pathwise_io__ as Server
  }
}
