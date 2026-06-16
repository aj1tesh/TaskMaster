import mongoose, { Schema, Document, Model, Types } from "mongoose";
import type { TaskStatus, TaskPriority } from "@/lib/types";

export type { TaskStatus, TaskPriority } from "@/lib/types";

export interface IRecurrence {
  freq: "daily" | "weekly" | "monthly";
  interval: number;
  daysOfWeek?: number[];
  endsAt?: Date;
}

export interface ITask extends Document {
  userId: Types.ObjectId;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId?: Types.ObjectId;
  parentTaskId?: Types.ObjectId;
  labelIds: Types.ObjectId[];
  dueDate?: Date;
  reminderAt?: Date;
  recurrence?: IRecurrence;
  order: number;
  timeEstimateMinutes?: number;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["inbox", "todo", "in_progress", "done", "blocked", "cancelled"],
      default: "inbox",
    },
    priority: {
      type: String,
      enum: ["none", "low", "medium", "high", "urgent"],
      default: "none",
    },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", index: true },
    parentTaskId: { type: Schema.Types.ObjectId, ref: "Task" },
    labelIds: [{ type: Schema.Types.ObjectId, ref: "Label" }],
    dueDate: { type: Date, index: true },
    reminderAt: { type: Date },
    recurrence: {
      freq: { type: String, enum: ["daily", "weekly", "monthly"] },
      interval: { type: Number, default: 1 },
      daysOfWeek: [{ type: Number }],
      endsAt: { type: Date },
    },
    order: { type: Number, default: 0 },
    timeEstimateMinutes: { type: Number },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

TaskSchema.index({ userId: 1, order: 1 });
TaskSchema.index({ userId: 1, status: 1 });
TaskSchema.index({ userId: 1, status: 1, completedAt: -1 });

export const Task: Model<ITask> =
  mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);
