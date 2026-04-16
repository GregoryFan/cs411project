import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

// POST: create a new activity entry for a user
export async function POST(req) {
  const { userId, date, activities } = await req.json()

  const entry = await prisma.activityEntry.create({
    data: {
      date: new Date(date),
      totalDayCO2: activities.reduce((sum, a) => sum + a.carbonImpact, 0),
      userId,
      activities: {
        create: activities.map(a => ({
          carbonImpact: a.carbonImpact,
          type: a.type,
          foodType: a.foodType ?? null,
          foodQuantity: a.foodQuantity ?? null,
          transportMode: a.transportMode ?? null,
          distance: a.distance ?? null,
          utilityType: a.utilityType ?? null,
          consumptionValue: a.consumptionValue ?? null,
        }))
      }
    },
    include: { activities: true }
  })

  return NextResponse.json(entry, { status: 201 })
}

// GET: fetch entry for a specific date (or range)
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  const date = searchParams.get('date')   // e.g. "2026-04-16"
  const range = searchParams.get('range') // e.g. "week", "month"

  if (!userId) return NextResponse.json({ error: 'userId is required' }, { status: 400 })

  const now = new Date()
  let startDate, endDate

  if (date) {
    // specific date — used for loading a day's entry
    startDate = new Date(date)
    startDate.setHours(0, 0, 0, 0)
    endDate = new Date(date)
    endDate.setHours(23, 59, 59, 999)
  } else if (range === 'week') {
    startDate = new Date(now); startDate.setDate(now.getDate() - 7); endDate = now
  } else if (range === 'month') {
    startDate = new Date(now); startDate.setMonth(now.getMonth() - 1); endDate = now
  } else if (range === 'year') {
    startDate = new Date(now); startDate.setFullYear(now.getFullYear() - 1); endDate = now
  } else {
    return NextResponse.json({ error: 'Provide a date or range' }, { status: 400 })
  }

  const entries = await prisma.activityEntry.findMany({
    where: { userId, date: { gte: startDate, lte: endDate } },
    include: { activities: true },
    orderBy: { date: 'desc' }
  })

  return NextResponse.json(entries, { status: 200 })
}

// PUT: update an existing entry (edit or add activities)
export async function PUT(req) {
  const { entryId, activities } = await req.json()

  if (!entryId || !activities) {
    return NextResponse.json({ error: 'entryId and activities are required' }, { status: 400 })
  }

  const existing = activities.filter(a => a.id)
  const newOnes = activities.filter(a => !a.id)

  const updatePromises = existing.map(a =>
    prisma.activity.update({
      where: { id: a.id },
      data: {
        carbonImpact: a.carbonImpact,
        type: a.type,
        foodType: a.foodType ?? null,
        foodQuantity: a.foodQuantity ?? null,
        transportMode: a.transportMode ?? null,
        distance: a.distance ?? null,
        utilityType: a.utilityType ?? null,
        consumptionValue: a.consumptionValue ?? null,
      }
    })
  )

  const createPromise = newOnes.length > 0
    ? prisma.activityEntry.update({
        where: { id: entryId },
        data: {
          activities: {
            create: newOnes.map(a => ({
              carbonImpact: a.carbonImpact,
              type: a.type,
              foodType: a.foodType ?? null,
              foodQuantity: a.foodQuantity ?? null,
              transportMode: a.transportMode ?? null,
              distance: a.distance ?? null,
              utilityType: a.utilityType ?? null,
              consumptionValue: a.consumptionValue ?? null,
            }))
          }
        },
        include: { activities: true }
      })
    : null

  await Promise.all(updatePromises)

  const entry = createPromise
    ? await createPromise
    : await prisma.activityEntry.findUnique({
        where: { id: entryId },
        include: { activities: true }
      })

  // recalculate totalDayCO2
  await prisma.activityEntry.update({
    where: { id: entryId },
    data: { totalDayCO2: entry.activities.reduce((sum, a) => sum + a.carbonImpact, 0) }
  })

  return NextResponse.json(entry, { status: 200 })
}