import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { authOptions } from '../../../auth/[...nextauth]/route';

export async function DELETE(req: Request, context: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = context.params;

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

    // Get the lecture
    const lecture = await db.lecture.findUnique({
      where: {
        id
      }
    });

    if (!lecture) {
      return NextResponse.json({ error: 'Lecture not found' }, { status: 404 });
    }

    // Check if the user is the tutor of this lecture
    if (lecture.tutorId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete all bookings for this lecture first
    await db.booking.deleteMany({
      where: {
        lectureId: id
      }
    });

    // Delete the lecture
    await db.lecture.delete({
      where: {
        id
      }
    });

    return NextResponse.json({ message: 'Lecture deleted successfully' });
  } catch (error) {
    console.error('Error deleting lecture:', error);
    return NextResponse.json(
      { error: 'Error deleting lecture' },
      { status: 500 }
    );
  }
} 