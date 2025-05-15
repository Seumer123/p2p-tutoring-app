'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Lecture {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  subject: string;
  createdAt: string;
  bookings: {
    id: string;
    date: string;
    status: string;
    user: {
      name: string;
      email: string;
    };
  }[];
}

export default function MyLecturesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    fetchLectures();
  }, [status, router]);

  const fetchLectures = async () => {
    try {
      const response = await fetch('/api/lectures/my-lectures');
      if (!response.ok) throw new Error('Failed to fetch lectures');
      
      const data = await response.json();
      setLectures(data);
    } catch (err) {
      setError('Failed to load lectures');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLecture = async (lectureId: string) => {
    if (!confirm('Are you sure you want to delete this lecture?')) return;

    try {
      const response = await fetch(`/api/lectures/delete/${lectureId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete lecture');
      
      // Refresh lectures after deletion
      fetchLectures();
    } catch (err) {
      setError('Failed to delete lecture');
      console.error(err);
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/bookings/update-status/${bookingId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update booking status');
      
      // Refresh lectures to get updated booking statuses
      fetchLectures();
    } catch (err) {
      setError('Failed to update booking status');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading lectures...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Lectures</h1>
          <Link
            href="/create-lecture"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Create New Lecture
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}

        {lectures.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">You haven't created any lectures yet.</p>
            <Link href="/create-lecture" className="text-indigo-600 hover:text-indigo-500 mt-4 inline-block">
              Create your first lecture
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {lectures.map((lecture) => (
              <div key={lecture.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">{lecture.title}</h2>
                    <p className="text-gray-600 mb-4">{lecture.description}</p>
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Subject:</span> {lecture.subject}
                      </p>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Price:</span> ${lecture.price}/hour
                      </p>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Duration:</span> {lecture.duration} minutes
                      </p>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Created:</span> {new Date(lecture.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {lecture.bookings.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Bookings</h3>
                        <div className="space-y-4">
                          {lecture.bookings.map((booking) => (
                            <div key={booking.id} className="border rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-sm text-gray-500">
                                    <span className="font-medium">Student:</span> {booking.user.name}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    <span className="font-medium">Email:</span> {booking.user.email}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    <span className="font-medium">Date:</span> {new Date(booking.date).toLocaleString()}
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
                                {booking.status === 'PENDING' && (
                                  <div className="space-x-2">
                                    <button
                                      onClick={() => handleUpdateBookingStatus(booking.id, 'CONFIRMED')}
                                      className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 text-sm"
                                    >
                                      Confirm
                                    </button>
                                    <button
                                      onClick={() => handleUpdateBookingStatus(booking.id, 'CANCELLED')}
                                      className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 text-sm"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteLecture(lecture.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                  >
                    Delete Lecture
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
} 