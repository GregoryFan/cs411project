import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const { userName } = await request.json();

    const user = await prisma.user.findFirst({
      where: {
        userName: {
          equals: userName,
          mode: "insensitive"
        }
      },
      select: {
        email: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Username not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      email: user.email
    });
  } catch {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}