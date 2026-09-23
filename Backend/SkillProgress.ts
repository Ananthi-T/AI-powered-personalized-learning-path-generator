import { Schema, model, models, type Model } from 'mongoose'

export type SkillAttempt = {
  date: Date
  score: number
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  timeTakenSeconds: number
  masteryLevel: 'Low' | 'Medium' | 'High'
}

export type SkillProgressDoc = {
  userId: string
  skill: string
  history: SkillAttempt[]
}

const SkillAttemptSchema = new Schema<SkillAttempt>({
  date: { type: Date, default: Date.now },
  score: { type: Number, required: true },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], required: true },
  timeTakenSeconds: { type: Number, required: true },
  masteryLevel: { type: String, enum: ['Low', 'Medium', 'High'], required: true }
}, { _id: false })

const SkillProgressSchema = new Schema<SkillProgressDoc>({
  userId: { type: String, required: true, index: true },
  skill: { type: String, required: true, index: true },
  history: { type: [SkillAttemptSchema], default: [] }
})

export const SkillProgressModel: Model<SkillProgressDoc> = (models.SkillProgress as Model<SkillProgressDoc>) || model<SkillProgressDoc>('SkillProgress', SkillProgressSchema)

