import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { lectureId, status } = await req.json();
    if (!lectureId) {
      return NextResponse.json({ error: 'Lecture ID is required' }, { status: 400 });
    }

    // Get the current user
    const user = await db.user.findUnique({
      where: { email: session.user.email }
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if the lecture exists
    const lecture = await db.lecture.findUnique({
      where: { id: lectureId }
    });
    if (!lecture) {
      return NextResponse.json({ error: 'Lecture not found' }, { status: 404 });
    }

    // Prevent double-booking (user already booked this lecture and it's not cancelled)
    const existingBooking = await db.booking.findFirst({
      where: {
        userId: user.id,
        lectureId,
        status: { not: 'CANCELLED' }
      }
    });
    if (existingBooking) {
      return NextResponse.json({ error: 'You have already booked this lecture.' }, { status: 400 });
    }

    // Set booking status (default to PENDING, allow CONFIRMED if provided)
    const bookingStatus = status === 'CONFIRMED' ? 'CONFIRMED' : 'PENDING';

    // Create the booking
    const booking = await db.booking.create({
      data: {
        userId: user.id,
        lectureId,
        date: new Date(),
        status: bookingStatus,
      }
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Error creating booking' }, { status: 500 });
  }
} 