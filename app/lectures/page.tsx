'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

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

export default function LecturesPage() {
  const { data: session } = useSession();
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    subject: '',
    minPrice: '',
    maxPrice: '',
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newLecture, setNewLecture] = useState({
    title: '',
    description: '',
    price: '',
    duration: '',
    subject: '',
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchLectures();
  }, [filters]);

  const fetchLectures = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.subject) queryParams.append('subject', filters.subject);
      if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
      if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);

      const response = await fetch(`/api/lectures/get?${queryParams}`);
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

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);
      const response = await fetch('/api/lectures/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newLecture),
      });

      if (!response.ok) throw new Error('Failed to create lecture');

      setNewLecture({
        title: '',
        description: '',
        price: '',
        duration: '',
        subject: '',
      });
      setShowCreateForm(false);
      fetchLectures();
    } catch (err) {
      setError('Failed to create lecture');
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Available Lectures</h1>
          {session?.user?.role === 'TUTOR' && (
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              {showCreateForm ? 'Cancel' : 'Create Lecture'}
            </button>
          )}
        </div>

        {showCreateForm && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold mb-4">Create New Lecture</h2>
            <form onSubmit={handleCreateLecture} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={newLecture.title}
                  onChange={(e) => setNewLecture(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  value={newLecture.description}
                  onChange={(e) => setNewLecture(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  rows={3}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    value={newLecture.subject}
                    onChange={(e) => setNewLecture(prev => ({ ...prev, subject: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                    Price per Hour ($)
                  </label>
                  <input
                    type="number"
                    id="price"
                    value={newLecture.price}
                    onChange={(e) => setNewLecture(prev => ({ ...prev, price: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    id="duration"
                    value={newLecture.duration}
                    onChange={(e) => setNewLecture(prev => ({ ...prev, duration: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  disabled={creating}
                  className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Lecture'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={filters.subject}
                onChange={handleFilterChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Filter by subject"
              />
            </div>
            <div>
              <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700">
                Min Price
              </label>
              <input
                type="number"
                id="minPrice"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Min price"
              />
            </div>
            <div>
              <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700">
                Max Price
              </label>
              <input
                type="number"
                id="maxPrice"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Max price"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">Loading lectures...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lectures.map((lecture) => (
              <div key={lecture.id} className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{lecture.title}</h2>
                <p className="text-gray-600 mb-4">{lecture.description}</p>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Tutor:</span> {lecture.tutor.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">University:</span> {lecture.tutor.university}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Major:</span> {lecture.tutor.major}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-indigo-600 font-medium">${lecture.price}/hour</span>
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                    Book Now
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