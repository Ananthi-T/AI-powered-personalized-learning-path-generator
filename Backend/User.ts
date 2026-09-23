import { Schema, model, models, type Model } from 'mongoose'

export type Profile = {
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
  dob?: string
  gender?: string
  phone?: string
  educationLevel?: string
  institutionName?: string
  branch?: string
}

export type UserDoc = {
  _id?: string
  name: string
  email: string
  passwordHash: string
  createdAt?: Date
  profile?: Profile
  profileCompleted?: boolean
  preferences?: {
    language?: 'English' | 'Tamil' | 'Hindi'
    theme?: 'Dark' | 'Light' | 'Blue Light'
    aiConsent?: boolean
    tracking?: boolean
  }
}

const UserSchema = new Schema<UserDoc>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  profile: { type: Object },
  profileCompleted: { type: Boolean, default: false },
  preferences: {
    type: Object,
    default: {
      language: 'English',
      theme: 'Dark',
      aiConsent: true,
      tracking: true
    }
  }
}, { timestamps: true })

export const UserModel: Model<UserDoc> = (models.User as Model<UserDoc>) || model<UserDoc>('User', UserSchema)
