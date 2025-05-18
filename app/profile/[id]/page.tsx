import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import ReviewSection from '../../components/ReviewSection';
import ContentLibrary from '../../components/ContentLibrary';

interface PageProps {
  params: {
    id: string;
  };
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: Date;
  reviewer: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface TutorWithReviews {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  bio: string | null;
  reviews: Review[];
  averageRating: string;
  reviewCount: number;
}

async function getTutorData(id: string): Promise<TutorWithReviews | null> {
  const tutor = await prisma.user.findUnique({
    where: { id },
    include: {
      reviewsReceived: {
        where: { revieweeRole: 'TUTOR' },
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      },
    },
  });

  if (!tutor) return null;

  const averageRating = tutor.reviewsReceived.length > 0
    ? tutor.reviewsReceived.reduce((acc: number, review: Review) => acc + review.rating, 0) / tutor.reviewsReceived.length
    : 0;

  return {
    ...tutor,
    reviews: tutor.reviewsReceived,
    averageRating: averageRating.toFixed(1),
    reviewCount: tutor.reviewsReceived.length,
  };
}

export default async function TutorProfilePage({ params }: PageProps) {
  const tutor = await getTutorData(params.id);

  if (!tutor) {
    return <div>User not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center gap-4">
          {tutor.image && (
            <Image
              src={tutor.image}
              alt={tutor.name || ''}
              width={100}
              height={100}
              className="rounded-full"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold">{tutor.name}</h1>
            <p className="text-gray-600">{tutor.email}</p>
            {tutor.role === 'TUTOR' && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-2xl font-bold text-yellow-500">★</span>
                <span className="text-xl font-semibold">{tutor.averageRating}</span>
                <span className="text-gray-500">({tutor.reviewCount} reviews)</span>
              </div>
            )}
          </div>
        </div>
        {tutor.bio && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold">About</h2>
            <p className="text-gray-700 mt-1">{tutor.bio}</p>
          </div>
        )}
        {tutor.role === 'TUTOR' && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-2">Content Library</h2>
            <ContentLibrary tutorId={tutor.id} />
          </div>
        )}
      </div>

      <ReviewSection userId={tutor.id} role={tutor.role as 'TUTOR' | 'STUDENT'} showAverageRating={false} />
    </div>
  );
} 