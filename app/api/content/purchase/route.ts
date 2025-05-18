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

    const { contentId } = await req.json();

    if (!contentId) {
      return NextResponse.json({ error: 'Content ID is required' }, { status: 400 });
    }

    // Get the user
    const user = await db.user.findUnique({
      where: {
        email: session.user.email
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get the content
    const content = await db.content.findUnique({
      where: {
        id: contentId
      }
    });

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    // Check if user has already purchased this content
    const existingPurchase = await db.contentPurchase.findFirst({
      where: {
        contentId,
        userId: user.id
      }
    });

    if (existingPurchase) {
      return NextResponse.json({ error: 'Content already purchased' }, { status: 400 });
    }

    // Create the purchase record
    const purchase = await db.contentPurchase.create({
      data: {
        contentId,
        userId: user.id,
        price: content.price
      }
    });

    // Increment the download count
    await db.content.update({
      where: {
        id: contentId
      },
      data: {
        downloads: {
          increment: 1
        }
      }
    });

    return NextResponse.json(purchase);
  } catch (error) {
    console.error('Error purchasing content:', error);
    return NextResponse.json(
      { error: 'Error purchasing content' },
      { status: 500 }
    );
  }
} 