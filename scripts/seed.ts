import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "../lib/db";
import { User } from "../models/User";
import { Project, PROJECT_COLORS } from "../models/Project";
import { Label } from "../models/Label";
import { Task } from "../models/Task";

async function seed() {
  await connectDB();

  await Promise.all([
    User.deleteMany({ email: "demo@todo.app" }),
  ]);

  const passwordHash = await bcrypt.hash("demo1234", 12);
  const user = await User.create({
    email: "demo@todo.app",
    name: "Ajitesh Singh",
    passwordHash,
    preferences: { theme: "dark", defaultView: "list", weekStart: 0 },
  });

  const projects = await Project.insertMany([
    { userId: user._id, name: "Backend", slug: "backend", colorHex: PROJECT_COLORS[1], order: 1 },
    { userId: user._id, name: "Mobile App", slug: "mobile-app", colorHex: PROJECT_COLORS[2], order: 2 },
    { userId: user._id, name: "Design System", slug: "design-system", colorHex: PROJECT_COLORS[4], order: 3 },
  ]);

  const labels = await Label.insertMany([
    { userId: user._id, name: "bug", colorHex: "#ef4444" },
    { userId: user._id, name: "feature", colorHex: "#3b82f6" },
    { userId: user._id, name: "docs", colorHex: "#22c55e" },
  ]);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(17, 0, 0, 0);

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 5);

  await Task.insertMany([
    { userId: user._id, title: "Review PR for auth middleware", status: "inbox", priority: "medium", order: 1 },
    { userId: user._id, title: "Fix login bug on Safari", status: "inbox", priority: "high", order: 2 },
    { userId: user._id, title: "Update API rate limiting docs", status: "inbox", priority: "none", order: 3 },
    {
      userId: user._id,
      title: "Deploy staging environment",
      status: "todo",
      priority: "urgent",
      projectId: projects[0]._id,
      dueDate: new Date(),
      order: 4,
    },
    {
      userId: user._id,
      title: "Write integration tests for tasks API",
      status: "in_progress",
      priority: "high",
      projectId: projects[0]._id,
      dueDate: new Date(),
      timeEstimateMinutes: 180,
      order: 5,
    },
    {
      userId: user._id,
      title: "Refactor MongoDB connection pool",
      status: "todo",
      priority: "medium",
      projectId: projects[0]._id,
      dueDate: tomorrow,
      order: 6,
    },
    {
      userId: user._id,
      title: "Implement bottom tab navigation",
      status: "todo",
      priority: "high",
      projectId: projects[1]._id,
      dueDate: tomorrow,
      order: 7,
    },
    {
      userId: user._id,
      title: "Audit color tokens against design spec",
      status: "todo",
      priority: "medium",
      projectId: projects[2]._id,
      dueDate: nextWeek,
      order: 8,
    },
    {
      userId: user._id,
      title: "Set up CI pipeline for lint + typecheck",
      status: "done",
      priority: "low",
      projectId: projects[0]._id,
      completedAt: new Date(),
      order: 9,
    },
    {
      userId: user._id,
      title: "Schedule 1:1 with design lead",
      status: "todo",
      priority: "none",
      dueDate: nextWeek,
      order: 10,
    },
  ]);

  console.log("Seed complete:");
  console.log("  Email: demo@todo.app");
  console.log("  Password: demo1234");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
