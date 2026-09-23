import { Schema, model, models, type Model } from 'mongoose'

export type OntologySkill = {
  skillName: string
  level: 'beginner' | 'intermediate' | 'advanced'
  prerequisites: string[]
  unlocks: string[]
  importanceWeight: number
}

export type RoleOntologyDoc = {
  role: string
  skills: OntologySkill[]
  createdAt?: Date
  updatedAt?: Date
}

const SkillSchema = new Schema<OntologySkill>({
  skillName: { type: String, required: true },
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
  prerequisites: { type: [String], default: [] },
  unlocks: { type: [String], default: [] },
  importanceWeight: { type: Number, min: 1, max: 3, default: 1 }
}, { _id: false })

const RoleOntologySchema = new Schema<RoleOntologyDoc>({
  role: { type: String, required: true, unique: true, index: true },
  skills: { type: [SkillSchema], default: [] }
}, { timestamps: true })

export const RoleOntologyModel: Model<RoleOntologyDoc> = (models.RoleOntology as Model<RoleOntologyDoc>) || model<RoleOntologyDoc>('RoleOntology', RoleOntologySchema)

