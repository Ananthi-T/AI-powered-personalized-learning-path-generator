import { Schema, model, models, Model } from 'mongoose'

export type ActivityLogDoc = {
  userId: string
  type: 'task' | 'validation'
  date: Date
}

const ActivityLogSchema = new Schema<ActivityLogDoc>({
  userId: { type: String, required: true, index: true },
  type: { type: String, enum: ['task', 'validation'], required: true },
  date: { type: Date, required: true, index: true }
})

export const ActivityLogModel: Model<ActivityLogDoc> = (models.ActivityLog as any) || model<ActivityLogDoc>('ActivityLog', ActivityLogSchema)
