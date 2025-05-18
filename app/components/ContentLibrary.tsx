'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import Link from 'next/link';
import ReviewModal from './ReviewModal';

interface Content {
  id: string;
  title: string;
  description: string;
  type: string;
  price: number;
  tags: string;
  createdAt: string;
  fileUrl?: string;
  tutor: {
    id: string;
    name: string;
  };
  purchasedAt?: string;
}

interface ContentLibraryProps {
  isTutor?: boolean;
  tutorId?: string;
}

export default function ContentLibrary({ isTutor = false, tutorId }: ContentLibraryProps) {
  console.log('ContentLibrary rendered');
  const { data: session } = useSession();
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const sectionTitle = isTutor && !tutorId ? 'My Content' : tutorId ? 'Content Library' : 'My Purchased Content';

  useEffect(() => {
    fetchContent();
  }, [isTutor, tutorId]);

  const fetchContent = async () => {
    setLoading(true);
    try {
      let endpoint = '/api/content/purchased';
      if (tutorId) {
        endpoint = `/api/content/tutor/${tutorId}`;
      } else if (isTutor) {
        endpoint = '/api/content/my-content';
      }
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error('Failed to fetch content');
      const data = await res.json();
      console.log('Fetched content:', data);
      setContent(data);
    } catch (err) {
      setError('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewClick = (content: Content) => {
    console.log('Selected content for review:', content);
    setSelectedContent(content);
    setIsReviewModalOpen(true);
  };

  const handleReviewSubmit = async (data: {
    rating: number;
    comment: string;
    selectedType: 'content' | 'lecture' | '';
    selectedId: string;
  }) => {
    try {
      if (!selectedContent) {
        setError('No content selected for review.');
        console.error('Review error: selectedContent is missing');
        return;
      }
      if (!selectedContent.tutor?.id) {
        setError('Tutor ID is missing for review.');
        console.error('Review error: tutorId is missing', selectedContent);
        return;
      }
      if (!selectedContent.id) {
        setError('Content ID is missing for review.');
        console.error('Review error: contentId is missing', selectedContent);
        return;
      }
      if (!data.rating) {
        setError('Rating is missing for review.');
        console.error('Review error: rating is missing', data);
        return;
      }
      if (!data.comment) {
        setError('Comment is missing for review.');
        console.error('Review error: comment is missing', data);
        return;
      }
      const body = {
        revieweeId: selectedContent.tutor.id,
        revieweeRole: 'TUTOR',
        rating: data.rating,
        comment: data.comment,
        contentId: selectedContent.id
      };
      console.log('Submitting review:', body);
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to submit review');
      setIsReviewModalOpen(false);
      setSelectedContent(null);
    } catch (err) {
      setError('Failed to submit review');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{sectionTitle}</h2>

      {content.length === 0 ? (
        <div className="text-gray-500">
          {isTutor ? 'You haven\'t uploaded any content yet.' : 'You haven\'t purchased any content yet.'}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {content.map((item) => {
            console.log('Rendering content item:', item);
            if (item.purchasedAt) {
              console.log('Should show Review button for:', item.title, item);
            }
            return (
              <div key={item.id} className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600 mb-4">{item.description}</p>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    {item.type} • {new Date(item.purchasedAt || '').toLocaleDateString()}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Test Button</Button>
                    {item.purchasedAt && (
                      <>
                        <Link href={`/profile/${item.tutor.id}`}>
                          <Button variant="outline" size="sm">
                            View Tutor
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleReviewClick(item)}
                        >
                          Review
                        </Button>
                      </>
                    )}
                    <a 
                      href={item.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      View Content
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
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
          purchases={[selectedContent]}
          bookings={[]}
          submitting={false}
        />
      )}
    </div>
  );
} 