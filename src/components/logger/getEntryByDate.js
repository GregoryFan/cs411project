"use server";
import { prisma } from "@/lib/prisma";

export async function getEntryByDate(userId, dateString) {
  const start = new Date(dateString);
  start.setHours(0, 0, 0, 0);
  const end = new Date(dateString);
  end.setHours(23, 59, 59, 999);

  return await prisma.activityEntry.findFirst({
    where: { userId, date: { gte: start, lte: end } },
    include: { activities: true },
  });
}