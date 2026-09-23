import { Schema, model, models, type Model } from 'mongoose'

export type RoleSkillsDoc = {
  careerGoal: string
  beginner: string[]
  intermediate: string[]
  advanced: string[]
  createdAt?: Date
  updatedAt?: Date
}

const RoleSkillsSchema = new Schema<RoleSkillsDoc>({
  careerGoal: { type: String, required: true, unique: true, index: true },
  beginner: { type: [String], default: [] },
  intermediate: { type: [String], default: [] },
  advanced: { type: [String], default: [] }
}, { timestamps: true })

export const RoleSkillsModel: Model<RoleSkillsDoc> = (models.RoleSkills as Model<RoleSkillsDoc>) || model<RoleSkillsDoc>('RoleSkills', RoleSkillsSchema)

