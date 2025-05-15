import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { 
      name, 
      email, 
      university, 
      major, 
      bio, 
      role,
      hourlyRate,
      subjects,
      expertise,
      availability
    } = body;

    // Start a transaction to update user and related data
    const updatedUser = await db.$transaction(async (tx) => {
      // Update user profile
      const user = await tx.user.update({
        where: {
          email: session.user.email!,
        },
        data: {
          name,
          university,
          major,
          bio,
          role,
          hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
          subjects,
        },
      });

      // If user is a tutor, update expertise and availability
      if (role === 'TUTOR') {
        // Delete existing expertise and availability
        await tx.expertise.deleteMany({
          where: { userId: user.id }
        });
        await tx.availability.deleteMany({
          where: { userId: user.id }
        });

        // Create new expertise entries
        if (expertise && expertise.length > 0) {
          await tx.expertise.createMany({
            data: expertise.map((exp: any) => ({
              ...exp,
              userId: user.id
            }))
          });
        }

        // Create new availability entries
        if (availability && availability.length > 0) {
          await tx.availability.createMany({
            data: availability.map((avail: any) => ({
              ...avail,
              userId: user.id
            }))
          });
        }
      }

      // Fetch updated user with relations
      return await tx.user.findUnique({
        where: { id: user.id },
        include: {
          expertise: true,
          availability: true
        }
      });
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error: any) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { message: 'Error updating profile' },
      { status: 500 }
    );
  }
} 