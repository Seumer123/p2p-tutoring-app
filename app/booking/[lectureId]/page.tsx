"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { format, isBefore, isSameDay } from 'date-fns';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

interface AvailabilitySlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface BookingPageProps {
  params: {
    lectureId: string;
  };
}

interface Booking {
  date: string; // ISO string
  time: string; // 'HH:mm'
}

interface Lecture {
  id: string;
  tutorId: string;
  // ...other fields
}

export default function BookingPage({ params }: BookingPageProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tutorId, setTutorId] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user) {
      router.push('/login');
    }
  }, [session, router]);

  useEffect(() => {
    fetchLectureAndTutor();
  }, []);

  useEffect(() => {
    if (tutorId) {
      fetchAvailability();
      fetchBookings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tutorId]);

  const fetchLectureAndTutor = async () => {
    try {
      const response = await fetch(`/api/lectures/get?id=${params.lectureId}`);
      if (!response.ok) throw new Error('Failed to fetch lecture details');
      const data: Lecture = await response.json();
      setTutorId(data.tutorId);
    } catch (error) {
      setError('Failed to load lecture details');
    }
  };

  const fetchAvailability = async () => {
    try {
      const response = await fetch(`/api/availability?tutorId=${tutorId}`);
      if (!response.ok) throw new Error('Failed to fetch availability');
      const data = await response.json();
      setAvailability(data);
    } catch (error) {
      setError('Failed to load available time slots');
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await fetch(`/api/bookings?tutorId=${tutorId}`);
      if (!response.ok) return;
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      // ignore
    }
  };

  // Get all available days in the next 30 days
  const getAvailableDays = () => {
    const days: Date[] = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayOfWeek = date.getDay();
      const slot = availability.find((a) => a.dayOfWeek === dayOfWeek);
      if (slot) {
        days.push(date);
      }
    }
    return days;
  };

  // For a given date, get all available time slots (excluding already booked)
  const getAvailableTimeSlots = (date: Date) => {
    const dayOfWeek = date.getDay();
    const slot = availability.find((a) => a.dayOfWeek === dayOfWeek);
    if (!slot) return [];
    const slots = [];
    const start = new Date(`2000-01-01T${slot.startTime}`);
    const end = new Date(`2000-01-01T${slot.endTime}`);
    for (let time = new Date(start); time < end; time.setMinutes(time.getMinutes() + 30)) {
      const timeStr = format(time, 'HH:mm');
      // Check if already booked
      const isBooked = bookings.some(
        (b) => isSameDay(new Date(b.date), date) && b.time === timeStr
      );
      if (!isBooked) {
        slots.push(timeStr);
      }
    }
    return slots;
  };

  // Disable days with no availability or in the past
  const tileDisabled = ({ date }: { date: Date }) => {
    const today = new Date();
    if (isBefore(date, today)) return true;
    const dayOfWeek = date.getDay();
    return !availability.some((a) => a.dayOfWeek === dayOfWeek);
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      setError('Please select both date and time');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lectureId: params.lectureId,
          date: selectedDate.toISOString(),
          time: selectedTime,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking');
      }
      setSuccess('Booking created successfully!');
      router.push('/bookings');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  if (!session?.user) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Book a Session</h1>
      <div className="mb-6">
        <Calendar
          onChange={(date) => {
            setSelectedDate(date as Date);
            setSelectedTime('');
          }}
          value={selectedDate}
          tileDisabled={tileDisabled}
          minDate={new Date()}
        />
      </div>
      {selectedDate && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">
            Available Time Slots for {format(selectedDate, 'PPP')}
          </h2>
          <div className="grid grid-cols-4 gap-2">
            {getAvailableTimeSlots(selectedDate).length === 0 ? (
              <span className="col-span-4 text-gray-500">No available slots</span>
            ) : (
              getAvailableTimeSlots(selectedDate).map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`p-2 border rounded-md ${
                    selectedTime === time
                      ? 'bg-indigo-600 text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {time}
                </button>
              ))
            )}
          </div>
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-100 text-green-700 rounded-md mb-4">
          {success}
        </div>
      )}
      <button
        onClick={handleBooking}
        disabled={loading || !selectedDate || !selectedTime}
        className={`w-full py-2 px-4 rounded-md text-white ${
          loading || !selectedDate || !selectedTime
            ? 'bg-gray-400'
            : 'bg-indigo-600 hover:bg-indigo-700'
        }`}
      >
        {loading ? 'Creating Booking...' : 'Book Session'}
      </button>
    </div>
  );
} 