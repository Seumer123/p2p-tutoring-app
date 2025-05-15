import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the current user
    const user = await db.user.findUnique({
      where: {
        email: session.user.email
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all bookings for the user
    const bookings = await db.booking.findMany({
      where: {
        userId: user.id
      },
      include: {
        lecture: {
          include: {
            tutor: {
              select: {
                name: true,
                university: true,
                major: true,
              }
            }
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Error fetching bookings' },
      { status: 500 }
    );
  }
} 