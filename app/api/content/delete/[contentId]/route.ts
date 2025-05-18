import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { authOptions } from '../../../auth/[...nextauth]/route';

export async function DELETE(req: Request, context: { params: { contentId: string } }) {
  try {
    const { contentId } = context.params;

    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the content and check ownership
    const content = await db.content.findUnique({
      where: { id: contentId },
    });
    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user || content.tutorId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete related purchases first (to avoid foreign key constraint)
    await db.contentPurchase.deleteMany({
      where: { contentId },
    });

    // Now delete the content
    await db.content.delete({
      where: { id: contentId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting content:', error);
    return NextResponse.json({ error: 'Error deleting content' }, { status: 500 });
  }
} 