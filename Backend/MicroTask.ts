import { Schema, model, models, type Model } from 'mongoose'

export type MicroTaskDoc = {
  userId: string
  title: string
  description?: string
  instructions?: string
  resourceUrl?: string
  taskType?: 'watch' | 'practice' | 'quiz' | 'read' | 'reflect'
  skill: string
  status: 'pending' | 'completed'
  createdAt?: Date
  completedAt?: Date
  planTaskId?: string
  date?: string
}

const MicroTaskSchema = new Schema<MicroTaskDoc>({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, required: false },
  instructions: { type: String, required: false },
  resourceUrl: { type: String, required: true },
  taskType: { type: String, enum: ['watch', 'practice', 'quiz', 'read', 'reflect'], required: false },
  skill: { type: String, required: true },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending', index: true },
  createdAt: { type: Date, required: false },
  completedAt: { type: Date, required: false },
  planTaskId: { type: String, required: false, index: true },
  date: { type: String, required: false, index: true }
})
MicroTaskSchema.index({ userId: 1, date: 1, title: 1 }, { unique: true })

export const MicroTaskModel: Model<MicroTaskDoc> = (models.MicroTask as any) || model<MicroTaskDoc>('MicroTask', MicroTaskSchema)
