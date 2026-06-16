import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ITimerSession extends Document {
  userId: Types.ObjectId;
  taskId: Types.ObjectId;
  startedAt: Date;
  endedAt?: Date;
  durationMinutes?: number;
  createdAt: Date;
  updatedAt: Date;
}

const TimerSessionSchema = new Schema<ITimerSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    taskId: { type: Schema.Types.ObjectId, ref: "Task", required: true, index: true },
    startedAt: { type: Date, required: true },
    endedAt: { type: Date },
    durationMinutes: { type: Number },
  },
  { timestamps: true }
);

TimerSessionSchema.index({ userId: 1, endedAt: 1 });
TimerSessionSchema.index({ userId: 1, startedAt: -1 });

export const TimerSession: Model<ITimerSession> =
  mongoose.models.TimerSession ||
  mongoose.model<ITimerSession>("TimerSession", TimerSessionSchema);
