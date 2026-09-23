import mongoose from 'mongoose'

mongoose.set('strictQuery', false)
mongoose.set('bufferCommands', false)

let connectingPromise: Promise<boolean> | null = null
let lastAttemptedConnection = false

export async function ensureConnection(): Promise<boolean> {
  if (mongoose.connection.readyState === mongoose.STATES.connected) return true
  if (connectingPromise) {
    try {
      return await connectingPromise
    } catch {
      return mongoose.connection.readyState >= 1
    }
  }
  if (lastAttemptedConnection) return false
  const uri = process.env.MONGODB_URI || process.env.DATABASE_URL
  if (!uri) {
    lastAttemptedConnection = true
    return false
  }
  connectingPromise = (async () => {
    try {
      const withTimeout = Promise.race([
        mongoose.connect(uri, {
          serverSelectionTimeoutMS: 2500,
          connectTimeoutMS: 3000,
          socketTimeoutMS: 5000,
          bufferCommands: false
        } as any),
        new Promise<never>((_, rej) => setTimeout(() => rej(new Error('timeout')), 3000))
      ])
      await withTimeout
      if (mongoose.connection.readyState !== mongoose.STATES.connected) {
        throw new Error('MongoDB failed to connect')
      }
      console.log('MongoDB Connected')
      return true
    } catch (error) {
      lastAttemptedConnection = true
      console.warn('MongoDB connection failed:', error?.message || error)
      return false
    } finally {
      connectingPromise = null
    }
  })()
  try {
    return await connectingPromise
  } catch {
    lastAttemptedConnection = true
    return false
  }
}
