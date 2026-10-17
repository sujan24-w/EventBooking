'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface EventBookingsModalProps {
  event: any;
  onClose: () => void;
}

export default function EventBookingModal({ event, onClose }: EventBookingsModalProps) {
  const [bookingsData, setBookingsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // Calls GET /api/admin/events/:eventId/bookings
        const res = await api.get(`/admin/events/${event.id}/bookings`);
        setBookingsData(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load event bookings.');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [event.id]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-blue-100 max-h-[90vh] overflow-y-auto">
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900">Event Bookings</h3>
            <p className="text-xs text-slate-500 mt-0.5">{event.title}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-slate-500 text-xs">Loading participant list...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs font-medium">{error}</div>
        ) : (
          <div>
            {/* Summary badges */}
            {bookingsData?.summary && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Total Bookings</p>
                  <p className="text-xl font-bold text-slate-800">{bookingsData.summary.total_bookings}</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <p className="text-[10px] uppercase font-bold text-emerald-600">Active Seats</p>
                  <p className="text-xl font-bold text-emerald-800">{bookingsData.summary.active_bookings}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                  <p className="text-[10px] uppercase font-bold text-red-600">Cancelled</p>
                  <p className="text-xl font-bold text-red-800">{bookingsData.summary.cancelled_bookings}</p>
                </div>
              </div>
            )}

            {/* Bookings table */}
            {bookingsData?.bookings?.length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-10">No bookings recorded for this event yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 uppercase font-bold">
                      <th className="p-3">User Name</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Booked At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bookingsData.bookings.map((b: any) => (
                      <tr key={b.booking_id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-semibold text-slate-800">{b.user_name}</td>
                        <td className="p-3 text-slate-500">{b.user_email}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 font-bold rounded-full text-[10px] ${
                            b.booking_status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {b.booking_status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500">{new Date(b.booked_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}