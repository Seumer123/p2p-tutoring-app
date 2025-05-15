'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';

interface Lecture {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  subject: string;
  tutor: {
    name: string;
    university: string;
    major: string;
    bio: string;
  };
}

export default function BookLecturePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = (useParams() ?? {}) as { lectureId?: string | string[] };
  const lectureId = typeof params.lectureId === 'string' ? params.lectureId : Array.isArray(params.lectureId) ? params.lectureId[0] : '';
  const [lecture, setLecture] = useState<Lecture | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingStatus, setBookingStatus] = useState('');

  useEffect(() => {
    if (!lectureId) return; // Don't fetch if lectureId is not available
    const fetchLecture = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/lectures/get?id=${lectureId}`);
        if (!response.ok) throw new Error('Failed to fetch lecture details');
        const data = await response.json();
        setLecture(data);
      } catch (err) {
        setError('Failed to load lecture details');
      } finally {
        setLoading(false);
      }
    };
    fetchLecture();
  }, [lectureId]);

  const handleConfirmBooking = async () => {
    if (!session) {
      setBookingStatus('Please log in to book a lecture.');
      return;
    }
    setBookingStatus('Booking...');
    try {
      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lectureId, status: 'CONFIRMED' }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to book lecture');
      }
      setBookingStatus('Booking confirmed! Redirecting to My Bookings...');
      setTimeout(() => {
        router.push('/my-bookings');
      }, 2000);
    } catch (err: any) {
      setBookingStatus(err.message || 'Failed to book lecture');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading lecture details...</div>;
  }
  if (error || !lecture) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">{error || 'Lecture not found.'}</div>;
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 py-8">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold mb-4">Confirm Your Booking</h1>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{lecture.title}</h2>
          <p className="text-gray-600 mb-2">{lecture.description}</p>
          <div className="mb-2">
            <p className="text-sm text-gray-500"><span className="font-medium">Tutor:</span> {lecture.tutor.name}</p>
            <p className="text-sm text-gray-500"><span className="font-medium">University:</span> {lecture.tutor.university}</p>
            <p className="text-sm text-gray-500"><span className="font-medium">Major:</span> {lecture.tutor.major}</p>
            <p className="text-sm text-gray-500"><span className="font-medium">Subject:</span> {lecture.subject}</p>
            <p className="text-sm text-gray-500"><span className="font-medium">Duration:</span> {lecture.duration} minutes</p>
            <p className="text-sm text-gray-500"><span className="font-medium">Price:</span> ${lecture.price}/hour</p>
          </div>
        </div>
        <button
          className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 mb-4"
          onClick={handleConfirmBooking}
          disabled={!!bookingStatus && bookingStatus !== 'Please log in to book a lecture.'}
        >
          Confirm Booking
        </button>
        {bookingStatus && (
          <div className="text-center text-indigo-700 mt-2">{bookingStatus}</div>
        )}
      </div>
    </main>
  );
} 