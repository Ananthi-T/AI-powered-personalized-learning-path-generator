import { Schema, model, models, type Model } from 'mongoose'

export type ProfileDoc = {
  userId: string
  currentRole?: string
  ageRange?: string
  careerGoal?: string
  targetTimeline?: string
  skillLevel?: string
  knownSkills?: string[]
  weeklyLearningTime?: string
  learningStyle?: string
  state?: string
  city?: string
  skillConfidence?: string
  motivation?: string
}

const ProfileSchema = new Schema<ProfileDoc>({
  userId: { type: String, index: true, required: true },
  currentRole: String,
  ageRange: String,
  careerGoal: String,
  targetTimeline: String,
  skillLevel: String,
  knownSkills: [String],
  weeklyLearningTime: String,
  learningStyle: String,
  state: String,
  city: String,
  skillConfidence: String,
  motivation: String,
}, { timestamps: true })

export const ProfileModel: Model<ProfileDoc> = (models.Profile as Model<ProfileDoc>) || model<ProfileDoc>('Profile', ProfileSchema)
