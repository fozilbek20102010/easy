import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

function getUser(req: NextRequest) {
  const auth = req.headers.get("Authorization");
  if (!auth) return null;
  try {
    return jwt.verify(auth.replace("Bearer ", ""), process.env.JWT_SECRET!) as { id: number; username: string };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  const todos = await prisma.todo.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(todos);
}

export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  const { title, description, priority } = await req.json();
  const todo = await prisma.todo.create({
    data: { title, description, priority, userId: user.id },
  });
  return NextResponse.json(todo);
}

export async function PATCH(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  const { id, done } = await req.json();
  const todo = await prisma.todo.update({
    where: { id, userId: user.id },
    data: { done },
  });
  return NextResponse.json(todo);
}

export async function DELETE(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  const { id } = await req.json();
  await prisma.todo.delete({ where: { id, userId: user.id } });
  return NextResponse.json({ success: true });
}