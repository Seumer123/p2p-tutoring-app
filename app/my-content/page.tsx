'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ReviewModal from '../../app/components/ReviewModal';

interface PurchasedContent {
  id: string;
  title: string;
  description: string;
  type: string;
  fileUrl: string;
  tutor: {
    id: string;
    name: string;
  };
  purchasedAt: string;
}

export default function MyContentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [contents, setContents] = useState<PurchasedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<PurchasedContent | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchPurchasedContent = async () => {
      try {
        const response = await fetch('/api/content/purchased');
        if (!response.ok) throw new Error('Failed to fetch purchased content');
        const data = await response.json();
        setContents(data);
      } catch (error) {
        console.error('Error fetching purchased content:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchPurchasedContent();
    }
  }, [session]);

  // Redirect if not logged in
  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const handleDownload = (fileUrl: string) => {
    window.open(fileUrl, '_blank');
  };

  const handleReviewClick = (content: PurchasedContent) => {
    setSelectedContent(content);
    setIsReviewModalOpen(true);
    setError('');
    setSuccess('');
  };

  const handleReviewSubmit = async (data: {
    rating: number;
    comment: string;
    selectedType: 'content' | 'lecture' | '';
    selectedId: string;
  }) => {
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      if (!selectedContent || !selectedContent.tutor?.id || !data.rating || !data.comment || !selectedContent.id) {
        setError('Missing required fields for review.');
        return;
      }
      const body = {
        revieweeId: selectedContent.tutor.id,
        revieweeRole: 'TUTOR',
        rating: data.rating,
        comment: data.comment,
        contentId: selectedContent.id
      };
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to submit review');
      setSuccess('Review submitted!');
      setIsReviewModalOpen(false);
      setSelectedContent(null);
    } catch (err) {
      setError('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Purchased Content</h1>
        
        {contents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">You haven't purchased any content yet.</p>
            <Button
              onClick={() => router.push('/tutors')}
              className="mt-4"
            >
              Browse Tutors
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contents.map((content) => (
              <Card key={content.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{content.title}</CardTitle>
                  <CardDescription>
                    By {content.tutor.name} • {content.type}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-gray-600">{content.description}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Purchased on {new Date(content.purchasedAt).toLocaleDateString()}
                  </p>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  <Button
                    onClick={() => handleDownload(content.fileUrl)}
                    className="w-full"
                  >
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleReviewClick(content)}
                    className="w-full"
                  >
                    Review
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
        {selectedContent && (
          <ReviewModal
            isOpen={isReviewModalOpen}
            onClose={() => {
              setIsReviewModalOpen(false);
              setSelectedContent(null);
            }}
            onSubmit={handleReviewSubmit}
            purchases={[{ id: selectedContent.id, title: selectedContent.title }]}
            bookings={[]}
            submitting={submitting}
          />
        )}
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        {success && <div className="text-green-500 text-sm mt-2">{success}</div>}
      </div>
    </div>
  );
} 