'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import ReviewModal from './ReviewModal';

interface Review {
  id: string;
  reviewer: { id: string; name: string; image?: string };
  rating: number;
  comment: string;
  createdAt: string;
  content?: { id: string; title: string } | null;
  lecture?: { id: string; title: string } | null;
}

interface ReviewSectionProps {
  userId: string;
  role: 'TUTOR' | 'STUDENT';
  showAverageRating?: boolean;
}

export default function ReviewSection({ userId, role, showAverageRating = false }: ReviewSectionProps) {
  console.log('ReviewSection mounted', { userId, role });
  const { data: session } = useSession();
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [eligible, setEligible] = useState(false);
  const [eligibilityChecked, setEligibilityChecked] = useState(false);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line
  }, [userId, role]);

  useEffect(() => {
    checkEligibility();
    // eslint-disable-next-line
  }, [userId, role, session]);

  useEffect(() => {
    if (eligible && role === 'TUTOR' && session?.user?.id) {
      fetchPurchasesAndBookings();
    }
    // eslint-disable-next-line
  }, [eligible, role, session]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews?userId=${userId}&role=${role}`);
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const checkEligibility = async () => {
    setEligibilityChecked(false);
    setEligible(false);
    if (!session?.user) return;
    if (session.user.id === userId) return; // Don't allow reviewing yourself
    
    try {
      const res = await fetch(`/api/reviews/eligibility?revieweeId=${userId}&role=${role}`);
      const data = await res.json();
      setEligible(data.eligible);
      if (!data.eligible) {
        setError(data.reason || 'You are not eligible to review this user.');
      }
    } catch (err) {
      setEligible(false);
      setError('Failed to check eligibility');
    } finally {
      setEligibilityChecked(true);
    }
  };

  const fetchPurchasesAndBookings = async () => {
    // Fetch purchases
    const purchasesRes = await fetch(`/api/content/purchased?withTutor=${userId}`);
    const purchasesData = await purchasesRes.json();
    setPurchases(purchasesData);
    // Fetch bookings
    const bookingsRes = await fetch(`/api/bookings/with-tutor?userId=${session?.user?.id}&tutorId=${userId}`);
    const bookingsData = await bookingsRes.json();
    setBookings(bookingsData);
  };

  const handleSubmitReview = async (data: {
    rating: number;
    comment: string;
    selectedType: 'content' | 'lecture' | '';
    selectedId: string;
  }) => {
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const body: any = { 
        revieweeId: userId, 
        revieweeRole: role, 
        rating: data.rating, 
        comment: data.comment 
      };
      if (data.selectedType === 'content') body.contentId = data.selectedId;
      if (data.selectedType === 'lecture') body.lectureId = data.selectedId;
      
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to submit review');
      setSuccess('Review submitted!');
      setIsModalOpen(false);
      fetchReviews();
      router.refresh();
    } catch (err) {
      setError('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <div className="mt-8 bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">
          {role === 'TUTOR' ? 'Tutor Reviews' : 'Student Reviews'}
        </h2>
        {showAverageRating && (
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-yellow-500">★</span>
            <span className="text-xl font-semibold">{averageRating}</span>
            <span className="text-gray-500">({reviews.length} reviews)</span>
          </div>
        )}
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : reviews.length === 0 ? (
        <div className="text-gray-500">No reviews yet.</div>
      ) : (
        <ul className="space-y-4 mb-6">
          {reviews.map((review) => (
            <li key={review.id} className="border-b pb-4">
              <div className="flex items-center gap-2 mb-1">
                {review.reviewer.image && (
                  <img src={review.reviewer.image} alt={review.reviewer.name} className="w-8 h-8 rounded-full" />
                )}
                <span className="font-semibold">{review.reviewer.name}</span>
                <span className="ml-2 text-yellow-500">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                <span className="ml-auto text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="text-gray-700">{review.comment}</div>
              {review.content && (
                <div className="text-xs text-gray-500 mt-1">Reviewed content: <span className="font-medium">{review.content.title}</span></div>
              )}
              {review.lecture && (
                <div className="text-xs text-gray-500 mt-1">Reviewed lecture: <span className="font-medium">{review.lecture.title}</span></div>
              )}
            </li>
          ))}
        </ul>
      )}

      {eligibilityChecked && eligible && (
        <Button onClick={() => setIsModalOpen(true)}>Write a Review</Button>
      )}

      {eligibilityChecked && !eligible && session?.user && (
        <div className="text-gray-500 text-sm mt-2">
          {role === 'TUTOR' 
            ? "You need to purchase content or attend a lecture to review this tutor."
            : "You need to have a booking with this student to review them."}
        </div>
      )}

      <ReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitReview}
        purchases={purchases}
        bookings={bookings}
        submitting={submitting}
      />

      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      {success && <div className="text-green-500 text-sm mt-2">{success}</div>}
    </div>
  );
} 