import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

//calls supabase to create an account
export async function POST(req) {
  const { email, password, userName } = await req.json()

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }


  await prisma.user.create({
    data: {
      id: data.user.id, 
      email,
      userName,
    }
  })

  return NextResponse.json({ message: 'Signup successful' }, { status: 201 })
}