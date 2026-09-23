import { Schema, model, models, type Model } from 'mongoose'

export type MissingSkillDoc = {
  userId: string
  skillName: string
  level: 'beginner' | 'intermediate' | 'advanced'
  progress: number
  completed: boolean
}

const MissingSkillSchema = new Schema<MissingSkillDoc>({
  userId: { type: String, required: true, index: true },
  skillName: { type: String, required: true, index: true },
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
  progress: { type: Number, default: 0 },
  completed: { type: Boolean, default: false }
}, { timestamps: true })

export const MissingSkillModel: Model<MissingSkillDoc> = (models.MissingSkill as any) || model<MissingSkillDoc>('MissingSkill', MissingSkillSchema)
