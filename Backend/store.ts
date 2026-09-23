import { promises as fs } from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
import { ensureConnection } from './db'

type ModelName =
  | 'MicroTask'
  | 'MissingSkill'
  | 'CareerSnapshot'
  | 'LearningPath'
  | 'SkillValidation'
  | 'ActivityLog'
  | 'DailyPlan'
  | 'SkillProgress'
  | 'Certificate'
  | 'Progress'
  | 'RoleOntology'
  | 'RoleSkills'

const STORE_DIR = path.join(process.cwd(), 'backend', 'data')

function storePath(model: ModelName): string {
  return path.join(STORE_DIR, `${model.toLowerCase()}.json`)
}

async function readStore<T = any>(model: ModelName): Promise<T[]> {
  try {
    const buf = await fs.readFile(storePath(model), 'utf-8')
    return JSON.parse(buf) as T[]
  } catch {
    return []
  }
}

async function writeStore<T>(model: ModelName, rows: T[]): Promise<void> {
  try {
    await fs.mkdir(STORE_DIR, { recursive: true })
  } catch {}
  await fs.writeFile(storePath(model), JSON.stringify(rows, null, 2), 'utf-8')
}

function toLean(doc: any): any {
  if (!doc) return doc
  if (typeof doc.toObject === 'function') return doc.toObject()
  return { ...(doc._doc || doc) }
}

function toLeanList(docs: any[]): any[] {
  return docs.map(toLean)
}

let modelCache: Record<string, any> = {}

async function getModel(name: ModelName) {
  if (modelCache[name]) return modelCache[name]
  const mod = await import(`../models/${name}`)
  const key = Object.keys(mod).find(k => k.includes('Model')) as string
  modelCache[name] = mod[key]
  return modelCache[name]
}

export async function useDB(): Promise<boolean> {
  return ensureConnection()
}

export async function findOne(modelName: ModelName, filter: any): Promise<any | null> {
  const connected = await useDB()
  if (connected) {
    const M = await getModel(modelName)
    const doc = await M.findOne(filter).lean()
    return doc ? toLean(doc) : null
  }
  const rows = await readStore(modelName)
  const entries = Object.entries(filter)
  return rows.find(r => entries.every(([k, v]) => r[k] === v)) || null
}

export async function findMany(modelName: ModelName, filter: any = {}): Promise<any[]> {
  const connected = await useDB()
  if (connected) {
    const M = await getModel(modelName)
    const docs = await M.find(filter).lean()
    return toLeanList(docs)
  }
  const rows = await readStore(modelName)
  const entries = Object.entries(filter)
  if (entries.length === 0) return rows
  return rows.filter(r => entries.every(([k, v]) => {
    if (v && typeof v === 'object' && Object.keys(v).length > 0) {
      const ops = Object.keys(v)
      for (const op of ops) {
        const val = (v as any)[op]
        const rowVal = r[k]
        if (op === '$gte') return new Date(rowVal) >= new Date(val)
        if (op === '$lte') return new Date(rowVal) <= new Date(val)
        if (op === '$gt') return new Date(rowVal) > new Date(val)
        if (op === '$lt') return new Date(rowVal) < new Date(val)
        if (op === '$in') return Array.isArray(val) && val.includes(rowVal)
      }
      return true
    }
    return r[k] === v
  }))
}

export async function create(modelName: ModelName, data: any): Promise<any> {
  const connected = await useDB()
  if (connected) {
    const M = await getModel(modelName)
    try {
      const doc = await M.create(data)
      return toLean(doc)
    } catch (e: any) {
      if (String(e?.code) === '11000') {
        return findOne(modelName, {
          userId: data.userId,
          date: data.date,
          title: data.title
        })
      }
      throw e
    }
  }
  const rows = await readStore(modelName)
  const created: any = {
    _id: randomUUID(),
    ...data,
    createdAt: data.createdAt || new Date(),
    updatedAt: new Date()
  }
  rows.push(created)
  await writeStore(modelName, rows)
  return created
}

export async function createMany(modelName: ModelName, items: any[]): Promise<any[]> {
  const connected = await useDB()
  if (connected) {
    const M = await getModel(modelName)
    const docs = await M.insertMany(items, { ordered: false })
    return toLeanList(docs)
  }
  const rows = await readStore(modelName)
  const created = items.map(data => ({
    _id: randomUUID(),
    ...data,
    createdAt: data.createdAt || new Date(),
    updatedAt: new Date()
  }))
  rows.push(...created)
  await writeStore(modelName, rows)
  return created
}

export async function findByIdAndUpdate(modelName: ModelName, id: string, updates: any): Promise<any | null> {
  const connected = await useDB()
  if (connected) {
    const M = await getModel(modelName)
    const doc = await M.findByIdAndUpdate(id, { $set: updates }, { new: true }).lean()
    return doc ? toLean(doc) : null
  }
  const rows = await readStore(modelName)
  const idx = rows.findIndex(r => r._id === id)
  if (idx < 0) return null
  rows[idx] = {
    ...rows[idx],
    ...updates,
    updatedAt: new Date()
  }
  await writeStore(modelName, rows)
  return rows[idx]
}

export async function updateOne(modelName: ModelName, filter: any, updates: any): Promise<any | null> {
  const connected = await useDB()
  if (connected) {
    const M = await getModel(modelName)
    const doc = await M.findOneAndUpdate(filter, { $set: updates }, { new: true }).lean()
    return doc ? toLean(doc) : null
  }
  const rows = await readStore(modelName)
  const entries = Object.entries(filter)
  const idx = rows.findIndex(r => entries.every(([k, v]) => r[k] === v))
  if (idx < 0) return null
  rows[idx] = {
    ...rows[idx],
    ...updates,
    updatedAt: new Date()
  }
  await writeStore(modelName, rows)
  return rows[idx]
}

export async function updateMany(modelName: ModelName, filter: any, updates: any): Promise<number> {
  const connected = await useDB()
  if (connected) {
    const M = await getModel(modelName)
    const res = await M.updateMany(filter, { $set: updates })
    return res.nModified || 0
  }
  const rows = await readStore(modelName)
  const entries = Object.entries(filter)
  let count = 0
  for (let i = 0; i < rows.length; i++) {
    if (entries.every(([k, v]) => rows[i][k] === v)) {
      rows[i] = { ...rows[i], ...updates, updatedAt: new Date() }
      count++
    }
  }
  if (count > 0) await writeStore(modelName, rows)
  return count
}

export async function findByIdAndDelete(modelName: ModelName, id: string): Promise<boolean> {
  const connected = await useDB()
  if (connected) {
    const M = await getModel(modelName)
    const res = await M.findByIdAndDelete(id)
    return !!res
  }
  const rows = await readStore(modelName)
  const before = rows.length
  const filtered = rows.filter(r => r._id !== id)
  if (filtered.length !== before) {
    await writeStore(modelName, filtered)
    return true
  }
  return false
}

export async function deleteMany(modelName: ModelName, filter: any): Promise<number> {
  const connected = await useDB()
  if (connected) {
    const M = await getModel(modelName)
    const res = await M.deleteMany(filter)
    return res.deletedCount || 0
  }
  const rows = await readStore(modelName)
  const entries = Object.entries(filter)
  const before = rows.length
  const filtered = rows.filter(r => !entries.every(([k, v]) => r[k] === v))
  const count = before - filtered.length
  if (count > 0) await writeStore(modelName, filtered)
  return count
}

export async function countDocuments(modelName: ModelName, filter: any = {}): Promise<number> {
  const connected = await useDB()
  if (connected) {
    const M = await getModel(modelName)
    return M.countDocuments(filter)
  }
  const rows = await readStore(modelName)
  const entries = Object.entries(filter)
  if (entries.length === 0) return rows.length
  return rows.filter(r => entries.every(([k, v]) => r[k] === v)).length
}
