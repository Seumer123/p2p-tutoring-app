'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function UploadContentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'document',
    price: '',
    subject: '',
    tags: '',
    file: null as File | null,
    thumbnail: null as File | null,
  });

  // Redirect if not logged in
  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  // Show loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // First, upload the files
      const fileFormData = new FormData();
      if (formData.file) {
        fileFormData.append('file', formData.file);
      }
      if (formData.thumbnail) {
        fileFormData.append('thumbnail', formData.thumbnail);
      }

      const uploadResponse = await fetch('/api/content/upload', {
        method: 'POST',
        body: fileFormData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload files');
      }

      const { fileUrl, thumbnailUrl } = await uploadResponse.json();

      // Then, create the content record
      const contentResponse = await fetch('/api/content/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          fileUrl,
          thumbnailUrl,
          tags: formData.tags.split(',').map(tag => tag.trim()),
        }),
      });

      if (!contentResponse.ok) {
        throw new Error('Failed to create content');
      }

      setSuccess('Content uploaded successfully!');
      setFormData({
        title: '',
        description: '',
        type: 'document',
        price: '',
        subject: '',
        tags: '',
        file: null,
        thumbnail: null,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to upload content');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'file' | 'thumbnail') => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        [type]: file
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Upload Content</CardTitle>
            <CardDescription>Share your educational content with students</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select content type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Price ($)</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Subject</label>
                <Input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
                <Input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="e.g., math, algebra, calculus"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Content File</label>
                <Input
                  type="file"
                  onChange={(e) => handleFileChange(e, 'file')}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Thumbnail (optional)</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'thumbnail')}
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}

              {success && (
                <div className="text-green-600 text-sm">{success}</div>
              )}

              <Button type="submit" disabled={loading}>
                {loading ? 'Uploading...' : 'Upload Content'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 