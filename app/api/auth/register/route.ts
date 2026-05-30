import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (!username || !password)
    return NextResponse.json({ error: "Ma'lumotlar to'liq emas" }, { status: 400 });

  const hashed = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from("users")
    .insert({ username, password: hashed })
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: "Bu username band" }, { status: 400 });

  const token = jwt.sign({ id: data.id, username }, process.env.JWT_SECRET!, { expiresIn: "7d" });

  return NextResponse.json({ token, username });
}