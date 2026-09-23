import { Schema, model, models, Model } from 'mongoose'

export type Question = {
  id: string
  type: 'MCQ' | 'Short'
  question: string
  options?: string[]
  correctAnswer?: number // index of correct option for MCQ
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
}

export type CodingChallenge = {
  title: string
  description: string
  starterCode: string
}

export type SkillValidationDoc = {
  userId: string
  skill: string
  level?: 'Beginner' | 'Intermediate' | 'Advanced'
  timeLimitSeconds?: number
  startedAt?: Date
  completedAt?: Date
  currentDifficulty?: 'beginner' | 'intermediate' | 'advanced'
  streakCorrect?: number
  streakWrong?: number
  usedQuestionIds?: string[]
  answers?: { id: string; answer: string | number; correct?: boolean }[]
  questions: Question[]
  codingChallenge?: CodingChallenge
  score?: number
  result?: 'Passed' | 'Needs Revision' | 'Skip Ahead'
  feedback?: string[]
  skillGaps?: string[]
  status: 'Generated' | 'Completed'
  createdAt: Date
}

const SkillValidationSchema = new Schema<SkillValidationDoc>({
  userId: { type: String, required: true, index: true },
  skill: { type: String, required: true },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'] },
  timeLimitSeconds: Number,
  startedAt: Date,
  completedAt: Date,
  currentDifficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
  streakCorrect: { type: Number, default: 0 },
  streakWrong: { type: Number, default: 0 },
  usedQuestionIds: [String],
  answers: [{ id: String, answer: Schema.Types.Mixed, correct: Boolean }],
  questions: [{
    id: String,
    type: { type: String, enum: ['MCQ', 'Short'], default: 'MCQ' },
    question: String,
    options: [String],
    correctAnswer: Number,
    difficulty: { type: String, enum: ['beginner','intermediate','advanced'] }
  }],
  codingChallenge: {
    title: String,
    description: String,
    starterCode: String
  },
  score: Number,
  result: { type: String, enum: ['Passed', 'Needs Revision', 'Skip Ahead'] },
  feedback: [String],
  skillGaps: [String],
  status: { type: String, enum: ['Generated', 'Completed'], default: 'Generated' },
  createdAt: { type: Date, default: Date.now }
})

export const SkillValidationModel: Model<SkillValidationDoc> = (models.SkillValidation as any) || model<SkillValidationDoc>('SkillValidation', SkillValidationSchema)
