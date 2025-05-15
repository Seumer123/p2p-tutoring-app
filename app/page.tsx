'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/hero.jpg')", // Replace with your image
          zIndex: 0,
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black opacity-60"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full w-full px-4">
        {/* Logo or App Name */}
        <h1 className="text-white text-4xl font-bold mb-8 mt-12">UniPeer Tutoring</h1>

        {/* Headline */}
        <h2 className="text-white text-2xl font-semibold mb-4 text-center">
          The Home of Peer Tutoring
        </h2>
        <p className="text-white text-lg mb-8 text-center max-w-md">
          Book or become a peer tutor for your university courses. Fast, easy, and student-friendly.
        </p>

        {/* Call to Action */}
        <Link href="/signup">
          <button className="bg-white text-black font-semibold px-8 py-3 rounded-lg shadow-lg hover:bg-gray-200 transition">
            Get Started
          </button>
        </Link>
        <p className="text-white text-xs mt-4">It’s free to join. Become a tutor or find one today!</p>
      </div>
    </main>
  );
}