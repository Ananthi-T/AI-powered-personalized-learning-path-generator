import { Schema, model, models, type Model } from 'mongoose'

export type CertificateDoc = {
  certificateId: string
  userId: string
  skill: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  score: number
  issuedAt: Date
}

const CertificateSchema = new Schema<CertificateDoc>({
  certificateId: { type: String, required: true, unique: true, index: true },
  userId: { type: String, required: true, index: true },
  skill: { type: String, required: true },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], required: true },
  score: { type: Number, required: true },
  issuedAt: { type: Date, default: Date.now }
})

export const CertificateModel: Model<CertificateDoc> = (models.Certificate as Model<CertificateDoc>) || model<CertificateDoc>('Certificate', CertificateSchema)

