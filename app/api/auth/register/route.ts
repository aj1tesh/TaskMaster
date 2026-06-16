import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { data: null, error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { data: null, error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    await connectDB();

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { data: null, error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      email: email.toLowerCase(),
      name,
      passwordHash,
    });

    return NextResponse.json(
      {
        data: { id: user._id.toString(), email: user.email, name: user.name },
        error: null,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { data: null, error: "Registration failed" },
      { status: 500 }
    );
  }
}
