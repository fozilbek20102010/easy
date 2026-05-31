import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (!username || !password)
    return NextResponse.json({ error: "Ma'lumotlar to'liq emas" }, { status: 400 });

  const hashed = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: { username, password: hashed },
    });

    const token = jwt.sign({ id: user.id, username }, process.env.JWT_SECRET!, { expiresIn: "7d" });
    return NextResponse.json({ token, username });
  } catch {
    return NextResponse.json({ error: "Bu username band" }, { status: 400 });
  }
}