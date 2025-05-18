import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

interface Review {
  id: string;
  rating: number;
}

interface TutorWithReviews {
  id: string;
  name: string | null;
  image: string | null;
  bio: string | null;
  university: string | null;
  major: string | null;
  hourlyRate: number | null;
  reviews: Review[];
}

interface Tutor {
  id: string;
  name: string | null;
  image: string | null;
  bio: string | null;
  university: string | null;
  major: string | null;
  hourlyRate: number | null;
  averageRating: string;
  reviewCount: number;
}

async function getTutors(): Promise<Tutor[]> {
  const tutors = await prisma.user.findMany({
    where: {
      role: 'TUTOR',
    },
    include: {
      reviews: {
        where: { revieweeRole: 'TUTOR' },
      },
    },
  });

  return tutors.map((tutor: TutorWithReviews) => {
    const averageRating = tutor.reviews.length > 0
      ? tutor.reviews.reduce((acc: number, review: Review) => acc + review.rating, 0) / tutor.reviews.length
      : 0;

    return {
      id: tutor.id,
      name: tutor.name,
      image: tutor.image,
      bio: tutor.bio,
      university: tutor.university,
      major: tutor.major,
      hourlyRate: tutor.hourlyRate,
      averageRating: averageRating.toFixed(1),
      reviewCount: tutor.reviews.length,
    };
  });
}

export default async function BrowseTutorsPage() {
  const tutors = await getTutors();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Browse Tutors</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tutors.map((tutor) => (
          <Link
            key={tutor.id}
            href={`/profile/${tutor.id}`}
            className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                {tutor.image ? (
                  <Image
                    src={tutor.image}
                    alt={tutor.name || ''}
                    width={64}
                    height={64}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded-full" />
                )}
                <div>
                  <h2 className="text-xl font-semibold">{tutor.name}</h2>
                  {tutor.university && (
                    <p className="text-gray-600">{tutor.university}</p>
                  )}
                </div>
              </div>
              {tutor.bio && (
                <p className="text-gray-700 mb-4 line-clamp-2">{tutor.bio}</p>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-yellow-500">★</span>
                  <span className="text-lg font-semibold">{tutor.averageRating}</span>
                  <span className="text-gray-500">({tutor.reviewCount})</span>
                </div>
                {tutor.hourlyRate && (
                  <span className="text-lg font-semibold">${tutor.hourlyRate}/hr</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 