import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const role = searchParams.get('role');
  if (!userId || !role) {
    return NextResponse.json({ error: 'Missing userId or role' }, { status: 400 });
  }
  const reviews = await db.review.findMany({
    where: {
      revieweeId: userId,
      revieweeRole: role,
    },
  });
  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)
      : '0.0';
  return NextResponse.json({
    averageRating,
    reviewCount: reviews.length,
  });
} 