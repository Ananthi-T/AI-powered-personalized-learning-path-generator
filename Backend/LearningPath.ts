import { Schema, model, models, type Model } from 'mongoose'

export type SkillNode = {
  id: string
  skill: string
  dependsOn: string[]
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  estimatedHours: number
}

export type LearningRoutes = {
  fast: SkillNode[]
  balanced: SkillNode[]
  deep: SkillNode[]
}

export type LearningStep = { title: string; duration?: string; description?: string }

export type LearningPathDoc = {
  userId: string
  routes?: LearningRoutes
  selectedRoute?: 'fast' | 'balanced' | 'deep'
  progress?: Record<string, 'locked' | 'in_progress' | 'completed'>
  generatedAt?: Date
  steps?: LearningStep[]
}

const SkillNodeSchema = new Schema<SkillNode>({
  id: { type: String, required: true },
  skill: { type: String, required: true },
  dependsOn: { type: [String], default: [] },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], required: true },
  estimatedHours: { type: Number, required: true }
}, { _id: false })

const LearningRoutesSchema = new Schema<LearningRoutes>({
  fast: { type: [SkillNodeSchema], default: [] },
  balanced: { type: [SkillNodeSchema], default: [] },
  deep: { type: [SkillNodeSchema], default: [] }
}, { _id: false })

const LearningPathSchema = new Schema<LearningPathDoc>({
  userId: { type: String, index: true, required: true },
  routes: { type: LearningRoutesSchema, default: undefined },
  selectedRoute: { type: String, enum: ['fast', 'balanced', 'deep'], default: 'balanced' },
  progress: { type: Object, default: {} },
  generatedAt: { type: Date },
  steps: [
    {
      title: String,
      duration: String,
      description: String
    }
  ]
}, { timestamps: true })

export const LearningPathModel: Model<LearningPathDoc> = (models.LearningPath as Model<LearningPathDoc>) || model<LearningPathDoc>('LearningPath', LearningPathSchema)
