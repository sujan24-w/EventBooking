import Link from 'next/link';

interface EventProps {
  event: {
    id: string;
    title: string;
    description: string;
    starts_at: string;
    venue: string;
    image_url?: string;
    event_status: string;
    available_seats: number;
    total_seats: number;
    is_sold_out: boolean;
    is_new: boolean;
  };
}

export default function EventCard({ event }: EventProps) {
  const startDate = new Date(event.starts_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden">
      
  
      <div className="h-48 bg-linear-to-tr from-blue-600 to-blue-400 relative p-4 flex flex-col justify-between text-white">
        {event.image_url && (
          <img 
            src={event.image_url} 
            alt={event.title} 
            className="absolute inset-0 w-full h-full object-cover opacity-30" 
          />
        )}
        
        {/* Badges */}
        <div className="flex justify-between items-center relative z-10">
          {event.is_new && (
            <span className="px-2.5 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full shadow">
              NEW
            </span>
          )}
          <span className={`px-2.5 py-1 text-xs font-bold rounded-full shadow ml-auto ${
            event.event_status === 'UPCOMING' ? 'bg-blue-700 text-white' :
            event.event_status === 'ONGOING' ? 'bg-amber-600 text-white' : 
            event.event_status === 'COMPLETED' ? 'bg-green-800 text-white' : 'bg-slate-700 text-white'
          }`}>
            {event.event_status}
          </span>
        </div>

        <div className="relative z-10">
          <p className="text-xs font-medium text-blue-100">{startDate}</p>
          <h3 className="text-xl font-bold tracking-tight line-clamp-1">{event.title}</h3>
        </div>
      </div>

      {/* Body Details */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <p className="text-sm text-slate-500 line-clamp-2 mb-2">
            {event.description || 'No description provided.'}
          </p>
          <p className="text-xs font-medium text-slate-600 flex items-center">
            <svg className="w-4 h-4 mr-1 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            {event.venue || 'Online Event'}
          </p>
        </div>

        {/* Seat Availability & Action */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className={`text-xs font-bold ${event.is_sold_out ? 'text-red-600' : 'text-emerald-600'}`}>
              {event.is_sold_out ? 'Sold Out' : `${event.available_seats} seats left`}
            </span>
            <p className="text-[10px] text-slate-400">Total: {event.total_seats}</p>
          </div>

          <Link
            href={`/events/${event.id}`}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
          >
            View Details
          </Link>
        </div>
      </div>

    </div>
  );
}