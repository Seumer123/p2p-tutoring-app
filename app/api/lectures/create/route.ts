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

    const { title, description, price, duration, subject } = await req.json();

    if (!title || !description || !price || !duration || !subject) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // First get the user by email since we don't have the ID in the session
    const currentUser = await db.user.findUnique({
      where: {
        email: session.user.email
      }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const lecture = await db.lecture.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        duration: parseInt(duration),
        subject,
        tutorId: currentUser.id,
      },
    });

    return NextResponse.json(lecture, { status: 201 });
  } catch (error) {
    console.error('Error creating lecture:', error);
    return NextResponse.json(
      { error: 'Error creating lecture' },
      { status: 500 }
    );
  }
} 