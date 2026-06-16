import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IProject extends Document {
  userId: Types.ObjectId;
  name: string;
  slug: string;
  colorHex: string;
  isArchived: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    colorHex: { type: String, required: true },
    isArchived: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ProjectSchema.index({ userId: 1, slug: 1 }, { unique: true });

export const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);

export { PROJECT_COLORS } from "@/lib/projects";
