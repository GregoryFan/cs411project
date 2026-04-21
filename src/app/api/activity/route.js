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
  const start = searchParams.get('start')
  const end = searchParams.get('end')

  if (!userId) return NextResponse.json({ error: 'userId is required' }, { status: 400 })

  if (start && end) {
    const startDate = new Date(start)
    const endDate = new Date(end)
    endDate.setHours(23, 59, 59, 999)

    const entries = await prisma.activityEntry.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      include: { activities: true },
      orderBy: { date: 'desc' }
    })

    return NextResponse.json(entries, { status: 200 })
  }
    
  const anchor = date ? new Date(date + "T12:00:00") : new Date();
  let startDate, endDate

  if (date && !range) {
    // Specific date — used for loading a single day's entry
    startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
  } else if (range === 'week') {
    const dayOfWeek = (anchor.getDay() + 6) % 7; // Mon = 0
    const monday = new Date(anchor);
    monday.setDate(anchor.getDate() - dayOfWeek);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    startDate = monday;
    endDate = sunday;
  } else if (range === 'month') {
    startDate = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    endDate = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0, 23, 59, 59);
  } else if (range === 'year') {
    startDate = new Date(anchor.getFullYear(), 0, 1);
    endDate = new Date(anchor.getFullYear(), 11, 31, 23, 59, 59);
  } else {
    return NextResponse.json({ error: 'Provide a date or range' }, { status: 400 });
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
  const { entryId, activities } = await req.json();
  if (!entryId || !activities) {
    return NextResponse.json({ error: 'entryId and activities are required' }, { status: 400 });
  }

  const existing = activities.filter(a => a.id);
  const newOnes = activities.filter(a => !a.id);

  // Find what's currently in the DB so we can diff for deletes
  const currentEntry = await prisma.activityEntry.findUnique({
    where: { id: entryId },
    include: { activities: true }
  });

  const incomingIds = new Set(existing.map(a => a.id));
  const toDelete = currentEntry.activities
    .filter(a => !incomingIds.has(a.id))
    .map(a => a.id);

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
  );

  const deletePromise = toDelete.length > 0
    ? prisma.activity.deleteMany({ where: { id: { in: toDelete } } })
    : null;

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
    : null;

  await Promise.all([...updatePromises, deletePromise].filter(Boolean));
  if (createPromise) await createPromise;

  // Fetch fresh after all mutations are done
  const finalEntry = await prisma.activityEntry.findUnique({
    where: { id: entryId },
    include: { activities: true }
  });

  await prisma.activityEntry.update({
    where: { id: entryId },
    data: { totalDayCO2: finalEntry.activities.reduce((sum, a) => sum + a.carbonImpact, 0) }
  });

  return NextResponse.json(finalEntry, { status: 200 });
}