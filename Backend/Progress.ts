import { Schema, model, models, Model } from 'mongoose'

export type ProgressDoc = {
  userId: string
  completedSkills: string[]
  accuracy: number
  speed: number // arbitrary metric, maybe tasks/week
  lastUpdated: Date
}

const ProgressSchema = new Schema<ProgressDoc>({
  userId: { type: String, required: true, unique: true },
  completedSkills: { type: [String], default: [] },
  accuracy: { type: Number, default: 0 },
  speed: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
})

export const ProgressModel: Model<ProgressDoc> = (models.Progress as any) || model<ProgressDoc>('Progress', ProgressSchema)
