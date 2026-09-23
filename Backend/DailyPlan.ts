import { Schema, model, models, Model } from 'mongoose'

export type DailyTask = {
  id: string
  type: 'Watch' | 'Read' | 'Build' | 'Reflect'
  title: string
  description: string
  estimatedMinutes: number
  completed: boolean
  completedAt?: Date
}

export type DailyPlanDoc = {
  userId: string
  date: string // YYYY-MM-DD
  skill: string
  tasks: DailyTask[]
  completion: number // 0-100
}

const DailyPlanSchema = new Schema<DailyPlanDoc>({
  userId: { type: String, required: true, index: true },
  date: { type: String, required: true, index: true },
  skill: { type: String, required: true },
  tasks: [{
    id: String,
    type: { type: String, enum: ['Watch', 'Read', 'Build', 'Reflect'] },
    title: String,
    description: String,
    estimatedMinutes: Number,
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, required: false }
  }],
  completion: { type: Number, default: 0 }
})

DailyPlanSchema.index({ userId: 1, date: 1 }, { unique: true })
export const DailyPlanModel: Model<DailyPlanDoc> = (models.DailyPlan as any) || model<DailyPlanDoc>('DailyPlan', DailyPlanSchema)
