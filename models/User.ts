import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISmartListFilter {
  projectId?: string;
  status?: string;
  priority?: string;
  labelId?: string;
  dueFrom?: string;
  dueTo?: string;
}

export interface ISmartList {
  id: string;
  name: string;
  filters: ISmartListFilter;
}

export interface IUserPreferences {
  theme: "dark" | "light";
  themeLevel?: number;
  defaultView: "list" | "board";
  weekStart: 0 | 1;
  smartLists?: ISmartList[];
}

export interface IUser extends Document {
  email: string;
  name: string;
  avatar?: string;
  passwordHash?: string;
  googleId?: string;
  preferences: IUserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String, required: true },
    avatar: { type: String },
    passwordHash: { type: String },
    googleId: { type: String, sparse: true, unique: true },
    preferences: {
      theme: { type: String, enum: ["dark", "light"], default: "dark" },
      themeLevel: { type: Number, min: 0, max: 100, default: 0 },
      defaultView: { type: String, enum: ["list", "board"], default: "list" },
      weekStart: { type: Number, enum: [0, 1], default: 0 },
      smartLists: [
        {
          id: String,
          name: String,
          filters: {
            projectId: String,
            status: String,
            priority: String,
            labelId: String,
            dueFrom: String,
            dueTo: String,
          },
        },
      ],
    },
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
