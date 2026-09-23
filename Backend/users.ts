import { randomUUID } from 'crypto'
import mongoose from 'mongoose'
import { promises as fs } from 'fs'
import path from 'path'
import { UserModel, type UserDoc, type Profile } from '../models/User'
import { ensureConnection } from './db'
import { hashPassword, comparePassword } from './hash'

const DATA_DIR = path.join(process.cwd(), 'backend', 'data')
const dataFile = path.join(DATA_DIR, 'users.json')

const DEFAULT_PREFS: NonNullable<Required<UserDoc>['preferences']> = {
  language: 'English',
  theme: 'Dark',
  aiConsent: true,
  tracking: true
}

async function ensureDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
  } catch {}
}

async function loadUsers(): Promise<UserDoc[]> {
  try {
    await ensureDir()
    const buf = await fs.readFile(dataFile, 'utf-8')
    return JSON.parse(buf) as UserDoc[]
  } catch {
    return []
  }
}

async function saveUsers(users: UserDoc[]): Promise<void> {
  await ensureDir()
  try {
    await fs.writeFile(dataFile, JSON.stringify(users, null, 2), 'utf-8')
  } catch (e) {
    console.error('saveUsers error:', e)
  }
}

function toUserDoc(doc: any): UserDoc | null {
  if (!doc) return null
  const obj = (doc as any).toObject ? (doc as any).toObject() : { ...(doc._doc || doc) }
  obj._id = String(obj._id)
  if (!obj.preferences) obj.preferences = { ...DEFAULT_PREFS }
  return obj as UserDoc
}

export async function findUserByEmail(email: string): Promise<UserDoc | null> {
  const connected = await ensureConnection()
  const normalized = String(email || '').toLowerCase()
  if (connected) {
    try {
      const doc = await UserModel.findOne({ email: normalized }).lean()
      return toUserDoc(doc)
    } catch (e) {
      console.warn('findUserByEmail mongo failed, falling back:', e)
    }
  }
  const users = await loadUsers()
  const u = users.find(u => String(u.email || '').toLowerCase() === normalized)
  if (!u) return null
  return {
    ...u,
    preferences: u.preferences || { ...DEFAULT_PREFS }
  }
}

export async function createUser(name: string, email: string, password: string): Promise<UserDoc> {
  const passwordHash = hashPassword(password)
  const connected = await ensureConnection()
  const normalized = String(email || '').toLowerCase()
  if (connected) {
    try {
      const created = await UserModel.create({
        name,
        email: normalized,
        passwordHash,
        profileCompleted: false,
        preferences: { ...DEFAULT_PREFS }
      })
      const doc = toUserDoc(created)!
      return doc
    } catch (e) {
      console.warn('createUser mongo failed, falling back to JSON:', e)
    }
  }
  const users = await loadUsers()
  const created: UserDoc = {
    _id: randomUUID(),
    name,
    email: normalized,
    passwordHash,
    createdAt: new Date(),
    profileCompleted: false,
    preferences: { ...DEFAULT_PREFS }
  }
  users.push(created)
  await saveUsers(users)
  return created
}

export async function verifyPassword(user: UserDoc, password: string): Promise<boolean> {
  if (!user || !user.passwordHash) return false
  return comparePassword(password, user.passwordHash)
}

export async function findUserById(id: string): Promise<UserDoc | null> {
  const connected = await ensureConnection()
  const isValidObjectId = id && /^[0-9a-fA-F]{24}$/.test(String(id))
  if (connected && isValidObjectId) {
    try {
      const doc = await UserModel.findById(id).lean()
      return toUserDoc(doc)
    } catch (e) {
      console.warn('findUserById mongo failed, falling back:', e)
    }
  }
  const users = await loadUsers()
  const u = users.find(u => String(u._id) === String(id))
  if (!u) return null
  return {
    ...u,
    preferences: u.preferences || { ...DEFAULT_PREFS }
  }
}

export async function updateUserProfile(id: string, profile: Profile, forceComplete: boolean = false): Promise<UserDoc | null> {
  const connected = await ensureConnection()
  const dataComplete = !!(profile?.currentRole && profile?.careerGoal && profile?.skillLevel && profile?.weeklyLearningTime)
  const isCompleted = forceComplete || dataComplete
  const isValidObjectId = id && /^[0-9a-fA-F]{24}$/.test(String(id))
  
  if (connected && isValidObjectId) {
    try {
      const doc = await UserModel.findByIdAndUpdate(
        id,
        { $set: { profile, profileCompleted: isCompleted } },
        { new: true, upsert: false }
      ).lean()
      return toUserDoc(doc)
    } catch (e) {
      console.warn('updateUserProfile mongo failed, falling back:', e)
    }
  }
  const users = await loadUsers()
  const idx = users.findIndex(u => String(u._id) === String(id))
  if (idx < 0) return null
  users[idx] = {
    ...users[idx],
    profile,
    profileCompleted: isCompleted,
    preferences: users[idx].preferences || { ...DEFAULT_PREFS }
  }
  await saveUsers(users)
  return users[idx]
}

export async function getUserPreferences(id: string): Promise<NonNullable<UserDoc['preferences']> | null> {
  const u = await findUserById(id)
  if (!u) return null
  return (u.preferences || { ...DEFAULT_PREFS }) as NonNullable<UserDoc['preferences']>
}

export async function updateUserPreferences(id: string, preferences: Partial<NonNullable<UserDoc['preferences']>>): Promise<UserDoc | null> {
  const connected = await ensureConnection()
  const isValidObjectId = id && /^[0-9a-fA-F]{24}$/.test(String(id))
  if (connected && isValidObjectId) {
    try {
      const doc = await UserModel.findByIdAndUpdate(
        id,
        { $set: { preferences: { ...DEFAULT_PREFS, ...preferences } } },
        { new: true }
      ).lean()
      return toUserDoc(doc)
    } catch (e) {
      console.warn('updateUserPreferences mongo failed, falling back:', e)
    }
  }
  const users = await loadUsers()
  const idx = users.findIndex(u => String(u._id) === String(id))
  if (idx < 0) return null
  const existing = users[idx].preferences || { ...DEFAULT_PREFS }
  users[idx] = {
    ...users[idx],
    preferences: { ...DEFAULT_PREFS, ...existing, ...preferences }
  }
  await saveUsers(users)
  return users[idx]
}

export async function changeUserPassword(id: string, oldPassword: string, newPassword: string): Promise<boolean> {
  const connected = await ensureConnection()
  const isValidObjectId = id && /^[0-9a-fA-F]{24}$/.test(String(id))
  if (connected && isValidObjectId) {
    try {
      const doc: any = await UserModel.findById(id).lean()
      if (!doc) return false
      const ok = await comparePassword(oldPassword, doc.passwordHash)
      if (!ok) return false
      await UserModel.findByIdAndUpdate(id, { $set: { passwordHash: hashPassword(newPassword) } })
      return true
    } catch (e) {
      console.warn('changeUserPassword mongo failed, falling back:', e)
    }
  }
  const users = await loadUsers()
  const idx = users.findIndex(u => String(u._id) === String(id))
  if (idx < 0) return false
  const ok = await comparePassword(oldPassword, users[idx].passwordHash)
  if (!ok) return false
  users[idx].passwordHash = hashPassword(newPassword)
  await saveUsers(users)
  return true
}

export async function deleteUser(id: string): Promise<boolean> {
  const connected = await ensureConnection()
  const isValidObjectId = id && /^[0-9a-fA-F]{24}$/.test(String(id))
  if (connected && isValidObjectId) {
    try {
      const res = await UserModel.findByIdAndDelete(id)
      if (res) return true
    } catch (e) {
      console.warn('deleteUser mongo failed, falling back:', e)
    }
  }
  const users = await loadUsers()
  const before = users.length
  const filtered = users.filter(u => String(u._id) !== String(id))
  await saveUsers(filtered)
  return before !== filtered.length
}
