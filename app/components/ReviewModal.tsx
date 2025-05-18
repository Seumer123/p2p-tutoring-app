import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    rating: number;
    comment: string;
    selectedType: 'content' | 'lecture' | '';
    selectedId: string;
  }) => Promise<void>;
  purchases: Array<{ id: string; title: string }>;
  bookings: Array<{ id: string; title: string }>;
  submitting: boolean;
}

export default function ReviewModal({
  isOpen,
  onClose,
  onSubmit,
  purchases,
  bookings,
  submitting
}: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [selectedType, setSelectedType] = useState<'content' | 'lecture' | ''>('');
  const [selectedId, setSelectedId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ rating, comment, selectedType, selectedId });
    // Reset form
    setRating(5);
    setComment('');
    setSelectedType('');
    setSelectedId('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">What are you reviewing?</label>
            <select
              value={selectedType && selectedId ? `${selectedType}:${selectedId}` : ''}
              onChange={e => {
                const [type, id] = e.target.value.split(':');
                setSelectedType(type as 'content' | 'lecture');
                setSelectedId(id);
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            >
              <option value="">Select...</option>
              {bookings.map((b) => (
                <option key={b.id} value={`lecture:${b.id}`}>Lecture: {b.title}</option>
              ))}
              {purchases.map((p) => (
                <option key={p.id} value={`content:${p.id}`}>Content: {p.title}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Rating</label>
            <div className="flex gap-2 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-2xl ${
                    star <= rating ? 'text-yellow-500' : 'text-gray-300'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Comment</label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={submitting || !selectedType || !selectedId}
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 