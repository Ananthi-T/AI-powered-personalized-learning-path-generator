import bcrypt from 'bcryptjs'

export function hashPassword(password: string): string {
  return bcrypt.hashSync(String(password || ''), 10)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  try {
    if (!password || !hash) return false
    return await bcrypt.compare(String(password), String(hash))
  } catch {
    try {
      return bcrypt.compareSync(String(password || ''), String(hash || ''))
    } catch {
      return false
    }
  }
}
