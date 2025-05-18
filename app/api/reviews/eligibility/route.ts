import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { authOptions } from '../../auth/[...nextauth]/route';

// GET /api/reviews/eligibility?revieweeId=...&role=...
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ eligible: false, reason: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const revieweeId = searchParams.get('revieweeId');
    const role = searchParams.get('role');
    if (!revieweeId || !role) {
      return NextResponse.json({ eligible: false, reason: 'Missing revieweeId or role' }, { status: 400 });
    }
    const reviewer = await db.user.findUnique({ where: { email: session.user.email } });
    if (!reviewer) {
      return NextResponse.json({ eligible: false, reason: 'Reviewer not found' }, { status: 404 });
    }
    // Students reviewing tutors: after booking or content purchase
    if (role === 'TUTOR') {
      const hasBooking = await db.booking.findFirst({
        where: {
          userId: reviewer.id,
          lecture: { tutorId: revieweeId },
          status: 'CONFIRMED',
        },
      });
      const hasPurchase = await db.contentPurchase.findFirst({
        where: {
          userId: reviewer.id,
          content: { tutorId: revieweeId },
        },
      });
      if (hasBooking || hasPurchase) {
        return NextResponse.json({ eligible: true });
      }
      return NextResponse.json({ eligible: false, reason: 'No completed booking or purchase' });
    }
    // Tutors reviewing students: only after completed booking
    if (role === 'STUDENT') {
      const hasBooking = await db.booking.findFirst({
        where: {
          lecture: { tutorId: reviewer.id },
          userId: revieweeId,
          status: 'CONFIRMED',
        },
      });
      if (hasBooking) {
        return NextResponse.json({ eligible: true });
      }
      return NextResponse.json({ eligible: false, reason: 'No completed booking' });
    }
    return NextResponse.json({ eligible: false, reason: 'Invalid role' }, { status: 400 });
  } catch (error) {
    console.error('Error checking review eligibility:', error);
    return NextResponse.json({ eligible: false, reason: 'Server error' }, { status: 500 });
  }
} 