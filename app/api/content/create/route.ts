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

    const {
      title,
      description,
      type,
      price,
      subject,
      tags,
      fileUrl,
      thumbnailUrl,
    } = await req.json();

    console.log('Creating content with data:', {
      title,
      description,
      type,
      price,
      subject,
      tags,
      fileUrl,
      thumbnailUrl,
    });

    if (!title || !description || !type || !price || !subject || !fileUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: {
        email: session.user.email
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('Found user:', user.id);

    const content = await db.content.create({
      data: {
        title,
        description,
        type,
        price: parseFloat(price),
        fileUrl,
        thumbnailUrl,
        subject,
        tags: JSON.stringify(tags),
        tutorId: user.id
      }
    });

    console.log('Created content:', content);

    return NextResponse.json(content);
  } catch (error) {
    console.error('Error creating content:', error);
    return NextResponse.json(
      { error: 'Error creating content' },
      { status: 500 }
    );
  }
} 