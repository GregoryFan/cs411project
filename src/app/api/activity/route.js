import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

//create a new activity
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

//get data based on day/month/week etc, used for both bringing up old information and statistics
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const range = searchParams.get('range')

  const now = new Date()
  let startDate

  if (range === 'day') {
    startDate = new Date(now)
    startDate.setHours(0, 0, 0, 0)
  } else if (range === 'week') {
    startDate = new Date(now)
    startDate.setDate(now.getDate() - 7)
  } else if (range === 'month') {
    startDate = new Date(now)
    startDate.setMonth(now.getMonth() - 1)
  } else if (range === 'year') {
    startDate = new Date(now)
    startDate.setFullYear(now.getFullYear() - 1)
  } else {
    return NextResponse.json({ error: 'Invalid range. Use day, week, month or year' }, { status: 400 })
  }

  const reports = await prisma.activityReport.findMany({
    where: {
      date: {
        gte: startDate,
        lte: now,
      }
    },
    include: {
      activities: true
    },
    orderBy: {
      date: 'desc'
    }
  })

  return NextResponse.json(reports, { status: 200 })
}

//put request for updating old information, and adding new reports 
export async function PUT(req) {
  const { reportId, activities } = await req.json()

  if (!reportId || !activities) {
    return NextResponse.json({ error: 'reportId and activities are required' }, { status: 400 })
  }

  //activites are handled differntly on whether they exist or not
  const existing = activities.filter(a => a.id)
  const newOnes = activities.filter(a => !a.id)

  //update existing entries
  const updatePromises = existing.map(a =>
    prisma.activity.update({
      where: { id: a.id },
      data: {
        type: a.type,
        subcategory: a.subcategory,
        quantity: a.quantity,
      }
    })
  )

  //add new entries
  const createPromise = newOnes.length > 0
    ? prisma.activityReport.update({
        where: { id: reportId },
        data: {
          activities: {
            create: newOnes.map(a => ({
              type: a.type,
              subcategory: a.subcategory,
              quantity: a.quantity,
            }))
          }
        },
        include: { activities: true }
      })
    : null
  
    //update the final report
  await Promise.all(updatePromises)
  const report = createPromise
    ? await createPromise
    : await prisma.activityReport.findUnique({
        where: { id: reportId },
        include: { activities: true }
      })

  return NextResponse.json(report, { status: 200 })
}