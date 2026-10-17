'use client';

import { useState } from 'react';
import api from '@/lib/api';

interface EventFormModalProps {
  eventToEdit?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EventFormModal({ eventToEdit, onClose, onSuccess }: EventFormModalProps) {
  const [title, setTitle] = useState(eventToEdit?.title || '');
  const [description, setDescription] = useState(eventToEdit?.description || '');
  const [venue, setVenue] = useState(eventToEdit?.venue || '');
  const [totalSeats, setTotalSeats] = useState(eventToEdit?.total_seats || 50);
  const [imageUrl, setImageUrl] = useState(eventToEdit?.image_url || '');
  const [startsAt, setStartsAt] = useState(eventToEdit?.starts_at ? eventToEdit.starts_at.slice(0, 16) : '');
  const [endsAt, setEndsAt] = useState(eventToEdit?.ends_at ? eventToEdit.ends_at.slice(0, 16) : '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      title,
      description,
      venue,
      total_seats: Number(totalSeats), 
      image_url: imageUrl || null,      
      starts_at: new Date(startsAt).toISOString(), 
      ends_at: new Date(endsAt).toISOString(),     
    };

    try {
      if (eventToEdit) {
        // PATCH /api/admin/:id    edit event 
        await api.patch(`/admin/${eventToEdit.id}`, payload);
      } else {
        // POST /api/admin/   create event
        await api.post('/admin', payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save event.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-blue-100 max-h-[90vh] overflow-y-auto">
        
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-extrabold text-slate-900">
            {eventToEdit ? 'Edit Event' : 'Create New Event'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl mb-4 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Event Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none text-sm text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none text-sm text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Venue</label>
              <input
                type="text"
                required
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none text-sm text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Total Seats</label>
              <input
                type="number"
                required
                min={1}
                value={totalSeats}
                onChange={(e) => setTotalSeats(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none text-sm text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Starts At</label>
              <input
                type="datetime-local"
                required
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none text-sm text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Ends At</label>
              <input
                type="datetime-local"
                required
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none text-sm text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Image URL (Optional)</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none text-sm text-slate-900"
            />
          </div>

          <div className="pt-4 flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-slate-300 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm transition disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <span>{eventToEdit ? 'Update Event' : 'Create Event'}</span>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}