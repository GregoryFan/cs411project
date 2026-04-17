import { createClient } from "@/app/lib/supabase/server";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { email, password, userName } = await req.json();

    // Basic validation
    if (!email || !password || !userName) {
      return NextResponse.json(
        { error: "Email, password, and username are required." },
        { status: 400 }
      );
    }

    // Check if user already exists in Prisma
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { userName }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json(
          { error: "Email is already registered." },
          { status: 409 }
        );
      }

      if (existingUser.userName === userName) {
        return NextResponse.json(
          { error: "Username is already taken." },
          { status: 409 }
        );
      }
    }

    const supabase = await createClient();

    // Create auth account in Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error || !data?.user) {
      return NextResponse.json(
        { error: error?.message || "Unable to create account." },
        { status: 400 }
      );
    }

    // Create matching Prisma user
    const user = await prisma.user.upsert({
      where: { id: data.user.id },
      update: { userName: userName }, 
      create: {
        id: data.user.id,
        email,
        userName,
      },
    });

    return NextResponse.json(
      {
        message: "Signup successful.",
        user,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Signup route error:", err);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

