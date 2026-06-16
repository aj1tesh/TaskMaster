import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ILabel extends Document {
  userId: Types.ObjectId;
  name: string;
  colorHex: string;
  createdAt: Date;
  updatedAt: Date;
}

const LabelSchema = new Schema<ILabel>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    colorHex: { type: String, required: true },
  },
  { timestamps: true }
);

LabelSchema.index({ userId: 1, name: 1 }, { unique: true });

export const Label: Model<ILabel> =
  mongoose.models.Label || mongoose.model<ILabel>("Label", LabelSchema);
