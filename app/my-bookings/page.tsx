'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Booking {
  id: string;
  date: string;
  status: string;
  lecture: {
    title: string;
    description: string;
    price: number;
    duration: number;
    subject: string;
    tutor: {
      name: string;
      university: string;
      major: string;
    };
  };
}

export default function MyBookingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    fetchBookings();
  }, [status, router]);

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings/get');
      if (!response.ok) throw new Error('Failed to fetch bookings');
      
      const data = await response.json();
      setBookings(data);
    } catch (err) {
      setError('Failed to load bookings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/update-status/${bookingId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });

      if (!response.ok) throw new Error('Failed to cancel booking');
      // Refresh bookings after cancellation
      fetchBookings();
    } catch (err) {
      setError('Failed to cancel booking');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading bookings...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bookings</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">You haven't made any bookings yet.</p>
            <Link href="/lectures" className="text-indigo-600 hover:text-indigo-500 mt-4 inline-block">
              Browse available lectures
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">{booking.lecture.title}</h2>
                    <p className="text-gray-600 mb-4">{booking.lecture.description}</p>
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Tutor:</span> {booking.lecture.tutor.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">University:</span> {booking.lecture.tutor.university}
                      </p>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Major:</span> {booking.lecture.tutor.major}
                      </p>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Subject:</span> {booking.lecture.subject}
                      </p>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Date:</span> {new Date(booking.date).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Duration:</span> {booking.lecture.duration} minutes
                      </p>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Price:</span> ${booking.lecture.price}/hour
                      </p>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Status:</span>{' '}
                        <span className={`font-medium ${
                          booking.status === 'CONFIRMED' ? 'text-green-600' :
                          booking.status === 'PENDING' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {booking.status}
                        </span>
                      </p>
                    </div>
                  </div>
                  {['PENDING', 'CONFIRMED'].includes(booking.status) && (
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
} 