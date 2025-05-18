import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const purchases = await db.contentPurchase.findMany({
      where: {
        userId: user.id
      },
      include: {
        content: {
          include: {
            tutor: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const purchasedContent = purchases
      .filter(purchase => purchase.content.tutor && purchase.content.tutor.id)
      .map(purchase => ({
        id: purchase.content.id,
        title: purchase.content.title,
        description: purchase.content.description,
        type: purchase.content.type,
        fileUrl: purchase.content.fileUrl,
        tutor: {
          id: purchase.content.tutor.id,
          name: purchase.content.tutor.name
        },
        purchasedAt: purchase.createdAt
      }));

    return NextResponse.json(purchasedContent);
  } catch (error) {
    console.error('Error fetching purchased content:', error);
    return NextResponse.json(
      { error: 'Error fetching purchased content' },
      { status: 500 }
    );
  }
} 