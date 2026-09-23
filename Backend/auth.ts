import jwt from 'jsonwebtoken'

const DEFAULT_SECRET = 'dev-pathwise-secret'

type TokenPayload = {
  sub: string
  name: string
  email: string
}

export function createToken(payload: TokenPayload, expires = '7d') {
  const secret = process.env.JWT_SECRET || DEFAULT_SECRET
  return jwt.sign(payload, secret, { expiresIn: expires })
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const secret = process.env.JWT_SECRET || DEFAULT_SECRET
    return jwt.verify(token, secret) as TokenPayload
  } catch {
    return null
  }
}

