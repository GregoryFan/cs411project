import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()


//Simple post request to add the data over.
export async function POST(req) {
  const { type, subcategory, quantity } = await req.json()

  const report = await prisma.activityReport.create({
    data: {
      date: new Date(),
      activities: {
        create: {
          type,
          subcategory,
          quantity,
        }
      }
    },
    include: {
      activities: true
    }
  })

  return NextResponse.json(report, { status: 201 })
}