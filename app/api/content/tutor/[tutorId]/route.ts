import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: Request,
  context: { params: { tutorId: string } }
) {
  try {
    console.log('Fetching content for tutor:', context.params.tutorId);
    const { tutorId } = context.params;

    // Get the tutor's content
    const contents = await db.content.findMany({
      where: {
        tutorId,
      },
      include: {
        tutor: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('Found contents:', contents);

    return NextResponse.json(contents);
  } catch (error) {
    console.error('Error fetching tutor content:', error);
    return NextResponse.json(
      { error: 'Error fetching tutor content' },
      { status: 500 }
    );
  }
} 