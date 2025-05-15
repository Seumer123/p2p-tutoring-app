import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const subject = searchParams.get('subject');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    const where: any = {};

    if (subject) {
      where.subject = subject;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    const lectures = await db.lecture.findMany({
      where,
      include: {
        tutor: {
          select: {
            name: true,
            university: true,
            major: true,
            bio: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(lectures);
  } catch (error: any) {
    console.error('Error fetching lectures:', error);
    return NextResponse.json(
      { error: error.message || 'Error fetching lectures' },
      { status: 500 }
    );
  }
} 