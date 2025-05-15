'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const { data: session, status } = useSession();

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
                <Link 
                  href="/lectures"
                  className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Browse Lectures
                </Link>
                <Link 
                  href="/become-lecturer"
                  className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Become a Lecturer
                </Link>
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