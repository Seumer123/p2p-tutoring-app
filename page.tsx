'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const success = searchParams?.get('success');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const callbackUrl = searchParams?.get('callbackUrl') || '/';
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
        rememberMe,
      });

      if (result?.error) {
        if (result.error === 'Please verify your email before logging in.') {
          setError('Please verify your email before logging in. Check your inbox for the verification email.');
        } else {
          setError('Invalid email or password');
        }
      } else {
        router.push(callbackUrl);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#2d293a] py-8 px-2">
      <div className="w-full max-w-4xl bg-[#23202f] rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden">
        {/* Left Side - Image and Text */}
        <div className="relative md:w-1/2 w-full h-64 md:h-auto flex flex-col justify-between bg-[#1a1823]">
          <Image
            src="/login/loginimage.png"
            alt="Login Visual"
            fill
            className="object-cover object-center opacity-80"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#23202f] via-transparent to-transparent" />
          <div className="relative z-10 flex flex-col h-full justify-between p-8">
            <div className="flex justify-between items-center">
              <span className="text-white font-bold text-xl tracking-widest">UniPeer</span>
              <Link href="/" className="text-xs bg-[#393552] text-white px-3 py-1 rounded-full hover:bg-[#524b6b] transition">Back to website</Link>
            </div>
            <div className="mb-4 mt-auto">
              <h2 className="text-white text-2xl font-semibold mb-2">Learning Together,<br /> Growing Together</h2>
              <div className="flex gap-1 mt-2">
                <span className="w-2 h-2 bg-white rounded-full inline-block opacity-60" />
                <span className="w-2 h-2 bg-white rounded-full inline-block opacity-40" />
                <span className="w-2 h-2 bg-white rounded-full inline-block opacity-20" />
              </div>
            </div>
          </div>
        </div>
        {/* Right Side - Form */}
        <div className="md:w-1/2 w-full flex flex-col justify-center p-8 bg-[#23202f]">
          <h2 className="text-3xl font-bold text-white mb-2">Sign in to your account</h2>
          <p className="text-sm text-gray-400 mb-6">Don't have an account? <Link href="/signup" className="text-[#a78bfa] hover:underline">Sign up</Link></p>
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{success}</span>
            </div>
          )}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-2" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            <div>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 rounded-lg bg-[#1a1823] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#a78bfa] border-none"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-4 py-3 rounded-lg bg-[#1a1823] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#a78bfa] border-none"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div className="flex items-center mb-2">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-[#a78bfa] focus:ring-[#a78bfa] border-gray-300 rounded"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember-me" className="ml-2 text-sm text-gray-300">
                Remember me
              </label>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-[#a78bfa] text-white font-semibold hover:bg-[#8b5cf6] transition disabled:opacity-50 mb-2"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <div className="flex items-center my-4">
            <div className="flex-grow h-px bg-[#393552]" />
            <span className="mx-3 text-gray-400 text-sm">or continue with</span>
            <div className="flex-grow h-px bg-[#393552]" />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => signIn('google')}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-[#23202f] border border-[#393552] text-white hover:bg-[#393552] transition"
            >
              <svg className="w-5 h-5" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.7 33.1 29.8 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.4l6.4-6.4C33.5 5.1 28.1 3 24 3 12.9 3 4 11.9 4 23s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.3-4z"/><path fill="#34A853" d="M6.3 14.7l7 5.1C15.1 17.1 19.2 14 24 14c2.7 0 5.2.9 7.2 2.4l6.4-6.4C33.5 5.1 28.1 3 24 3c-7.7 0-14.2 4.4-17.7 10.7z"/><path fill="#FBBC05" d="M24 44c5.8 0 10.7-1.9 14.3-5.1l-6.6-5.4C29.8 36 24 36 24 36c-5.8 0-10.7-1.9-14.3-5.1l6.6-5.4C18.2 33.1 23.1 36 24 36z"/><path fill="#EA4335" d="M44.5 20H24v8.5h11.7C34.7 33.1 29.8 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.4l6.4-6.4C33.5 5.1 28.1 3 24 3c-7.7 0-14.2 4.4-17.7 10.7z"/></g></svg>
              Google
            </button>
            <button
              type="button"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-[#23202f] border border-[#393552] text-white hover:bg-[#393552] transition"
              disabled
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="white" d="M17.564 3.564A9 9 0 1 0 21 12a8.963 8.963 0 0 0-3.436-8.436ZM12 21a8.96 8.96 0 0 1-7.485-3.985h4.23v-5.25H6.75v-2.25h1.995V8.25A2.25 2.25 0 0 1 11.25 6h1.5v2.25h-1.5v1.5h1.5v2.25h-1.5v5.25h4.23A8.96 8.96 0 0 1 12 21Zm7.485-3.985h-4.23v-5.25h1.5v-2.25h-1.5v-1.5h1.5V6h-1.5A2.25 2.25 0 0 1 12.75 8.25v1.5h-1.5v2.25h1.5v5.25h-4.23A8.96 8.96 0 0 1 12 21a8.96 8.96 0 0 1 7.485-3.985Z"/></svg>
              Apple
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}