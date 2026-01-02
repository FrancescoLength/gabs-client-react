import React from 'react';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../api';
import MyBookings from './MyBookings';
import ClassList from './ClassList';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { parse, format } from 'date-fns';
import { parseBookingDate } from '../../utils/dateUtils';
import { Booking, ClassSession } from '../../types';

const parseAvailableClassDate = (dateString: string) => {
  return parse(dateString, 'dd/MM/yyyy', new Date());
};

function LiveBookingPage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  // 1. Fetch My Bookings
  const { data: myBookings = [], isLoading: loadingBookings, error: errorBookings, refetch: refetchBookings } = useQuery<Booking[]>({
    queryKey: ['bookings'],
    queryFn: () => api.getMyBookings(),
    enabled: !!token,
  });

  // 2. Fetch Classes
  const { data: allClasses = [], isLoading: loadingClasses, error: errorClasses, refetch: refetchClasses } = useQuery({
    queryKey: ['classes'],
    queryFn: () => api.getClasses(),
    enabled: !!token,
  });

  const loading = loadingBookings || loadingClasses;
  const error = errorBookings || errorClasses;

  const availableClasses = React.useMemo(() => {
    if (!myBookings || !allClasses) return [];

    const bookedSet = new Set();
    myBookings.forEach((b: Booking) => {
      const dateObj = parseBookingDate(b.date);
      if (dateObj) {
        const dateStr = format(dateObj, 'yyyy-MM-dd');
        bookedSet.add(`${b.name}|${dateStr}|${b.time}`);
      }
    });

    return allClasses.filter((c: ClassSession) => {
      // Assuming 'date' property exists on ClassSession for this filtering logic 
      // but checking the interface, ClassSession only has start_time/end_time/name/instructor?
      // Wait, api.ts getClasses returns ClassSession[]. 
      // Let's check api.ts/types. 
      // The current types match what was in api.ts previously. 
      // But the logic here uses `c.date`. 
      // If `c.date` is missing from ClassSession, this will error.
      // I should update ClassSession in types/index.ts if needed, but I'll stick to what I see here.
      // Actually `getClasses` endpoint usually returns classes with dates? 
      // Or maybe `allClasses` contains objects that have a `date` property?
      // I will leave `any` cast for `c` here inside filter to be safe if the type is incomplete, 
      // OR I should update ClassSession. The prompt asked to replace `any`.
      // Let's use `any` for `c` inside this specific filter for now to avoid breaking if my ClassSession definition is too narrow.
      // Actually, looking at the code `parseAvailableClassDate(c.date)`, it definitely has a date.
      // ClassSession now includes 'date' property.
      const dateObj = parseAvailableClassDate(c.date);
      if (!dateObj) return true;
      const dateStr = format(dateObj, 'yyyy-MM-dd');
      return !bookedSet.has(`${c.name}|${dateStr}|${c.start_time}`);
    });

  }, [myBookings, allClasses]);

  const handleActionSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['bookings'] });
    queryClient.invalidateQueries({ queryKey: ['classes'] });
  };

  if (error) {
    return (
      <div className="p-6 bg-white border border-red-100 rounded-2xl shadow-sm text-center">
        <h3 className="text-lg font-bold text-red-700 mb-2">Unavailable</h3>
        <p className="text-gray-500 mb-4">{error instanceof Error ? error.message : 'Error loading data'}</p>
        <button onClick={() => { refetchBookings(); refetchClasses(); }} className="px-4 py-2 bg-brand-red text-white rounded-lg hover:bg-brand-red-hover transition shadow-sm">Retry Connection</button>
      </div>
    );
  }

  return loading ? (
    <div className="flex flex-col items-center justify-center p-20 text-brand-muted space-y-4">
      <div className="w-12 h-12 border-4 border-brand-red-light border-t-brand-red rounded-full animate-spin"></div>
      <p className="font-medium">Loading schedule...</p>
    </div>
  ) : (
    <div className="mb-20">
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-extrabold text-brand-dark mb-2 tracking-tight">Live Booking</h1>
        <p className="text-brand-muted text-lg">View real-time availability and manage your bookings.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
        {/* My Bookings Column */}
        <div className="lg:col-span-12 xl:col-span-5 order-2 xl:order-1">
          <div className="xl:sticky xl:top-24">
            <h3 className="text-xl font-bold text-brand-dark mb-4 flex items-center">
              My Upcoming Bookings
              <span className="ml-3 bg-brand-red text-white text-xs font-bold px-2.5 py-1 rounded-full">{myBookings.length}</span>
            </h3>
            <MyBookings bookings={myBookings} onActionSuccess={handleActionSuccess} />
          </div>
        </div>

        {/* Available Classes Column */}
        <div className="lg:col-span-12 xl:col-span-7 order-1 xl:order-2">
          <h3 className="text-xl font-bold text-brand-dark mb-4">Available Classes</h3>
          <ClassList classes={availableClasses} onActionSuccess={handleActionSuccess} />
        </div>
      </div>
    </div>
  );
}

export default LiveBookingPage;
