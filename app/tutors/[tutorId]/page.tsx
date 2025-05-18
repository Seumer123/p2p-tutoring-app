'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import ContentLibrary from '../../components/ContentLibrary';

interface TutorProfile {
  id: string;
  name: string;
  email: string;
  university: string;
  major: string;
  bio: string;
  hourlyRate: number;
  subjects: string[];
  expertise: { subject: string; level: string; description: string }[];
  availability: { dayOfWeek: number; startTime: string; endTime: string }[];
  image: string;
}

export default function TutorProfilePage() {
  const params = useParams();
  const [tutor, setTutor] = useState<TutorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTutorProfile = async () => {
      try {
        const response = await fetch(`/api/tutors/${params.tutorId}`);
        if (!response.ok) throw new Error('Failed to fetch tutor profile');
        const data = await response.json();
        setTutor(data);
      } catch (err) {
        setError('Failed to load tutor profile');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (params.tutorId) {
      fetchTutorProfile();
    }
  }, [params.tutorId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error || !tutor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">{error || 'Tutor not found'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative w-24 h-24">
              <Image
                src={tutor.image || '/default-avatar.svg'}
                alt={tutor.name}
                fill
                className="rounded-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{tutor.name}</h1>
              <p className="text-gray-600">{tutor.university}</p>
              <p className="text-gray-600">{tutor.major}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900">About</h2>
              <p className="mt-2 text-gray-600">{tutor.bio}</p>
            </div>

            <div>
              <h2 className="text-lg font-medium text-gray-900">Hourly Rate</h2>
              <p className="mt-2 text-gray-600">${tutor.hourlyRate}/hour</p>
            </div>

            <div>
              <h2 className="text-lg font-medium text-gray-900">Subjects</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {tutor.subjects.map((subject, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </div>

            {tutor.expertise && tutor.expertise.length > 0 && (
              <div>
                <h2 className="text-lg font-medium text-gray-900">Expertise</h2>
                <dl className="mt-2 divide-y divide-gray-200">
                  {tutor.expertise.map((exp, index) => (
                    <div key={index} className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-500">{exp.subject}</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                        {exp.level} - {exp.description}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {tutor.availability && tutor.availability.length > 0 && (
              <div>
                <h2 className="text-lg font-medium text-gray-900">Availability</h2>
                <dl className="mt-2 divide-y divide-gray-200">
                  {tutor.availability.map((avail, index) => (
                    <div key={index} className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-500">
                        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][avail.dayOfWeek]}
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                        {avail.startTime} - {avail.endTime}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>

        {/* Content Library Section */}
        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Content Library</h2>
          <ContentLibrary tutorId={tutor.id} isOwner={false} />
        </div>
      </div>
    </div>
  );
} 