import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { supabase } from "@/lib/supabase";

function getUser(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as { id: number; username: string };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const { data } = await supabase
    .from("todos")
    .select()
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const { title, description, priority } = await req.json();

  const { data } = await supabase
    .from("todos")
    .insert({ user_id: user.id, title, description, priority })
    .select()
    .single();

  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const { id, done } = await req.json();

  const { data } = await supabase
    .from("todos")
    .update({ done })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const { id } = await req.json();

  await supabase.from("todos").delete().eq("id", id).eq("user_id", user.id);

  return NextResponse.json({ success: true });
}