import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get user profile with related data
    const user = await db.user.findUnique({
      where: {
        email: session.user.email!,
      },
      include: {
        expertise: true,
        availability: true,
      },
      select: {
        name: true,
        email: true,
        university: true,
        major: true,
        bio: true,
        role: true,
        hourlyRate: true,
        subjects: true,
        expertise: true,
        availability: true,
        rating: true,
        totalReviews: true,
        isVerified: true,
      },
    });

    return NextResponse.json(user, { status: 200 });
  } catch (error: any) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { message: 'Error fetching profile' },
      { status: 500 }
    );
  }
} 