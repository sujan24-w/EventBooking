 'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function EventDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Booking action states
  const [bookingLoading, setBookingLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch event details
  const fetchEventDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/events/${id}`);
      setEvent(response.data.event);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load event details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchEventDetails();
    }
  }, [id]);

  // Handle Book Seat Action
  const handleBookSeat = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setBookingLoading(true);
    setFeedback(null);

    try {
      // Calls router.post("/:eventId", authMiddleware, createBooking)
      const response = await api.post(`/bookings/${id}`);
      
      setFeedback({
        type: 'success',
        text: response.data.message || 'Seat booked successfully!',
      });

      // Refresh event details to update available seats dynamically
      await fetchEventDetails();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to book seat. Please try again.';
      setFeedback({
        type: 'error',
        text: errorMsg,
      });
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-32">
        <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-slate-500 text-sm font-medium">Loading event details...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="p-6 bg-red-50 border border-red-200 text-red-600 rounded-2xl mb-6 font-medium">
          {error || 'Event not found.'}
        </div>
        <Link href="/events" className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold shadow-sm hover:bg-blue-700 transition">
          Back to Events
        </Link>
      </div>
    );
  }

  const startDate = new Date(event.starts_at).toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  const endDate = event.ends_at
    ? new Date(event.ends_at).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Back Link */}
      <Link href="/events" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 mb-6 transition-colors">
        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Events
      </Link>

      <div className="bg-white rounded-3xl border border-blue-100 shadow-sm overflow-hidden">
        
        {/* Banner / Header */}
        <div className="h-64 sm:h-80 bg-linear-to-tr from-blue-700 to-blue-400 relative p-6 sm:p-10 flex flex-col justify-end text-white">
          {event.image_url && (
            <img src={event.image_url} alt={event.title} className="absolute inset-0 w-full h-full object-cover opacity-25" />
          )}
          <div className="relative z-10 flex flex-wrap gap-2 mb-3">
            <span className={`px-3 py-1 text-xs font-bold rounded-full shadow ${
              event.event_status === 'UPCOMING' ? 'bg-blue-800 text-white' :
              event.event_status === 'ONGOING' ? 'bg-amber-600 text-white' : 'bg-slate-700 text-white'
            }`}>
              {event.event_status}
            </span>
            {event.is_new && (
              <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full shadow">
                NEW
              </span>
            )}
            {event.is_cancelled && (
              <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full shadow">
                CANCELLED
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight relative z-10">{event.title}</h1>
        </div>

        {/* Content Section */}
        <div className="p-6 sm:p-10 space-y-8">
          
          {/* Grid Layout for Info & Booking Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Left: Description & Schedule */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">About This Event</h3>
                <p className="text-slate-600 text-base leading-relaxed whitespace-pre-line">
                  {event.description || 'No detailed description provided for this event.'}
                </p>
              </div>

              <div className="border-t border-slate-100 pt-6 space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Starts At</h4>
                    <p className="text-sm font-semibold text-slate-800">{startDate}</p>
                    {endDate && <p className="text-xs text-slate-500 mt-0.5">Ends: {endDate}</p>}
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Location / Venue</h4>
                    <p className="text-sm font-semibold text-slate-800">{event.venue || 'Online / Virtual Event'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Booking Action Widget */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-6 flex flex-col justify-between space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-4">Seat Reservation</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Total Capacity</span>
                    <span className="font-bold text-slate-800">{event.total_seats}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Available Seats</span>
                    <span className={`font-bold ${event.available_seats > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {event.available_seats}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, (event.available_seats / event.total_seats) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Feedback Banner */}
                {feedback && (
                  <div className={`p-3 rounded-xl text-xs font-medium mb-4 ${
                    feedback.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {feedback.text}
                  </div>
                )}
              </div>

              {/* Book Button */}
              <div>
                {event.is_cancelled ? (
                  <div className="w-full py-3 bg-slate-200 text-slate-500 text-center font-semibold rounded-xl text-sm cursor-not-allowed">
                    Event Cancelled
                  </div>
                ) : event.available_seats <= 0 ? (
                  <div className="w-full py-3 bg-red-100 text-red-600 text-center font-semibold rounded-xl text-sm cursor-not-allowed">
                    Sold Out
                  </div>
                ) : (
                  <button
                    onClick={handleBookSeat}
                    disabled={bookingLoading}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md shadow-blue-500/25 transition disabled:opacity-50 text-sm flex items-center justify-center space-x-2"
                  >
                    {bookingLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing Booking...</span>
                      </>
                    ) : (
                      <span>Book One Seat</span>
                    )}
                  </button>
                )}

                {!user && (
                  <p className="text-[11px] text-center text-slate-400 mt-2">
                    You will be asked to log in before booking.
                  </p>
                )}
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}