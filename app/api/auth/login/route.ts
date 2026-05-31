import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user)
    return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid)
    return NextResponse.json({ error: "Parol noto'g'ri" }, { status: 401 });

  const token = jwt.sign({ id: user.id, username }, process.env.JWT_SECRET!, { expiresIn: "7d" });
  return NextResponse.json({ token, username });
}