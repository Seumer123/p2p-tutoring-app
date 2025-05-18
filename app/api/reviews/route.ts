import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { authOptions } from '../auth/[...nextauth]/route';

// POST /api/reviews
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { revieweeId, revieweeRole, rating, comment, contentId, lectureId } = await req.json();
    if (!revieweeId || !revieweeRole || !rating || (!contentId && !lectureId)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const reviewer = await db.user.findUnique({ where: { email: session.user.email } });
    if (!reviewer) {
      return NextResponse.json({ error: 'Reviewer not found' }, { status: 404 });
    }
    const review = await db.review.create({
      data: {
        reviewerId: reviewer.id,
        revieweeId,
        revieweeRole,
        rating,
        comment,
        contentId: contentId || undefined,
        lectureId: lectureId || undefined,
      },
    });
    return NextResponse.json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Error creating review' }, { status: 500 });
  }
}

// GET /api/reviews?userId=...&role=...
export async function GET(req: Request) {
  try {
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
      include: {
        reviewer: { select: { id: true, name: true, image: true } },
        content: { select: { id: true, title: true } },
        lecture: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Error fetching reviews' }, { status: 500 });
  }
} 