import { createClient } from '@/app/lib/supabase/server'
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

//calls supabase to create an account
export async function POST(req) {
  const { email, password, userName } = await req.json()
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({ email, password })
  console.log("supabase data:", data)
  console.log("supabase error:", error)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  try {
    const user = await prisma.user.create({
      data: {
        id: data.user.id,
        email,
        userName,
      }
    })
    console.log("prisma user created:", user)
  } catch (e) {
    console.error("prisma error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Signup successful' }, { status: 201 })
}