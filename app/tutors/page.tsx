"use client";
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function TutorsPage() {
  const [tutors, setTutors] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [filteredTutors, setFilteredTutors] = useState<any[]>([]);

  useEffect(() => {
    const fetchTutors = async () => {
      const res = await fetch('/api/tutors');
      const data = await res.json();
      setTutors(data);
    };
    fetchTutors();
  }, []);

  useEffect(() => {
    let filtered = tutors;
    if (search) {
      filtered = filtered.filter(tutor =>
        tutor.name.toLowerCase().includes(search.toLowerCase()) ||
        tutor.bio?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (subjectFilter) {
      filtered = filtered.filter(tutor =>
        tutor.subjects.some((s: any) => s.name.toLowerCase().includes(subjectFilter.toLowerCase()))
      );
    }
    setFilteredTutors(filtered);
  }, [search, subjectFilter, tutors]);

  // Collect all unique subjects for filter dropdown
  const allSubjects = Array.from(new Set(tutors.flatMap(t => t.subjects.map((s: any) => s.name))));

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Find a Tutor</h1>
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="Search by name or bio..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full md:w-1/2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <select
            value={subjectFilter}
            onChange={e => setSubjectFilter(e.target.value)}
            className="w-full md:w-1/4 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">All Subjects</option>
            {allSubjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTutors.map(tutor => (
            <div key={tutor.id} className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
              <div className="relative w-24 h-24 mb-4">
                <Image
                  src={tutor.image || '/default-avatar.svg'}
                  alt={tutor.name}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <h2 className="text-xl font-semibold mb-1">{tutor.name}</h2>
              <div className="text-gray-500 text-sm mb-2">
                {tutor.subjects.map((s: any) => s.name).join(', ') || 'No subjects'}
              </div>
              <div className="text-yellow-500 mb-2">
                {tutor.rating ? `⭐ ${tutor.rating.toFixed(1)}` : 'No rating yet'}
              </div>
              <div className="text-indigo-600 font-bold mb-2">
                {tutor.hourlyRate ? `$${tutor.hourlyRate}/hr` : 'Rate not set'}
              </div>
              <div className="text-gray-700 text-sm text-center mb-2 line-clamp-3">
                {tutor.bio || 'No bio provided.'}
              </div>
              {/* Add a link to view full profile or book */}
              <a href={`/profile/${tutor.id}`} className="mt-2 text-indigo-600 hover:underline text-sm">View Profile</a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 