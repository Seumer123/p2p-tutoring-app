'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';

export default function Navbar() {
  const { data: session, status } = useSession();
  const [showLearnMenu, setShowLearnMenu] = useState(false);
  const [showTeachMenu, setShowTeachMenu] = useState(false);

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            {!session ? (
              <Link href="/" className="flex items-center">
                <span className="text-xl font-bold text-indigo-600">UniPeer</span>
              </Link>
            ) : (
              <span className="text-xl font-bold text-indigo-600">UniPeer</span>
            )}
            {session && (
              <div className="hidden md:flex space-x-6">
                {/* Learn Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowLearnMenu(!showLearnMenu)}
                    className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                  >
                    Learn
                    <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showLearnMenu && (
                    <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                      <div className="py-1">
                        <Link
                          href="/lectures"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowLearnMenu(false)}
                        >
                          Browse Lectures
                        </Link>
                        <Link
                          href="/my-bookings"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowLearnMenu(false)}
                        >
                          My Bookings
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Teach Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowTeachMenu(!showTeachMenu)}
                    className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                  >
                    Teach
                    <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showTeachMenu && (
                    <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                      <div className="py-1">
                        <Link
                          href="/create-lecture"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowTeachMenu(false)}
                        >
                          Create Lecture
                        </Link>
                        <Link
                          href="/my-lectures"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowTeachMenu(false)}
                        >
                          My Lectures
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {status === 'loading' ? (
              <span>Loading...</span>
            ) : session ? (
              <>
                <Link 
                  href="/profile"
                  className="text-gray-700 hover:text-indigo-600"
                >
                  Profile
                </Link>
                <button
                  onClick={() => signOut()}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login"
                  className="text-gray-700 hover:text-indigo-600"
                >
                  Login
                </Link>
                <Link 
                  href="/signup"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}