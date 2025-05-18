import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const tutors = await db.user.findMany({
      where: { role: 'TUTOR' },
      select: {
        id: true,
        name: true,
        image: true,
        subjects: { select: { name: true } },
        rating: true,
        hourlyRate: true,
        bio: true,
      },
    });
    return NextResponse.json(tutors, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Error fetching tutors' }, { status: 500 });
  }
} 