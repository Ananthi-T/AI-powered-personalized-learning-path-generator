import { Schema, model, models, type Model } from 'mongoose'

export type GroupedMissingSkills = {
  beginner: string[]
  intermediate: string[]
  advanced: string[]
}
export type CareerSnapshotDoc = {
  userId: string
  targetRole: string
  readinessScore: number
  missingSkills: GroupedMissingSkills
  estimatedMonths: number
  confidenceLevel: 'Low' | 'Medium' | 'High'
  status?: 'completed' | 'pending' | 'failed'
  generatedAt?: Date
  createdAt?: Date
}

const GroupedSchema = new Schema<GroupedMissingSkills>({
  beginner: { type: [String], default: [] },
  intermediate: { type: [String], default: [] },
  advanced: { type: [String], default: [] }
}, { _id: false })

const CareerSnapshotSchema = new Schema<CareerSnapshotDoc>({
  userId: { type: String, index: true, unique: true, required: true },
  targetRole: { type: String, required: true },
  readinessScore: { type: Number, required: true },
  missingSkills: { type: GroupedSchema, default: { beginner: [], intermediate: [], advanced: [] } },
  estimatedMonths: { type: Number, required: true },
  confidenceLevel: { type: String, enum: ['Low', 'Medium', 'High'], required: false },
  status: { type: String, enum: ['completed', 'pending', 'failed'], default: 'completed' },
  generatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
})

export const CareerSnapshotModel: Model<CareerSnapshotDoc> = (models.CareerSnapshot as Model<CareerSnapshotDoc>) || model<CareerSnapshotDoc>('CareerSnapshot', CareerSnapshotSchema)
