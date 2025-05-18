import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: { tutorId: string } }
) {
  try {
    const tutor = await db.user.findUnique({
      where: {
        id: params.tutorId,
        role: 'TUTOR'
      },
      include: {
        subjects: true,
        expertise: true,
        availability: true
      }
    });

    if (!tutor) {
      return NextResponse.json({ error: 'Tutor not found' }, { status: 404 });
    }

    // Transform the data to match the frontend interface
    const tutorProfile = {
      id: tutor.id,
      name: tutor.name,
      email: tutor.email,
      university: tutor.university,
      major: tutor.major,
      bio: tutor.bio,
      hourlyRate: tutor.hourlyRate,
      subjects: tutor.subjects.map(s => s.name),
      expertise: tutor.expertise,
      availability: tutor.availability,
      image: tutor.image
    };

    return NextResponse.json(tutorProfile);
  } catch (error) {
    console.error('Error fetching tutor profile:', error);
    return NextResponse.json(
      { error: 'Error fetching tutor profile' },
      { status: 500 }
    );
  }
} 