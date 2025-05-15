import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, subject, price, duration } = await req.json();

    if (!title || !description || !subject || !price || !duration) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
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

    // Create the lecture
    const lecture = await db.lecture.create({
      data: {
        title,
        description,
        subject,
        price: parseFloat(price),
        duration: parseInt(duration),
        tutorId: user.id
      }
    });

    // Update user role to TUTOR if not already
    if (user.role !== 'TUTOR') {
      await db.user.update({
        where: { id: user.id },
        data: { role: 'TUTOR' }
      });
    }

    return NextResponse.json(lecture, { status: 200 });
  } catch (error) {
    console.error('Error creating lecture:', error);
    return NextResponse.json(
      { error: 'Error creating lecture. Please try again.' },
      { status: 500 }
    );
  }
} 