
import AutoBookingScheduler from './AutoBookingScheduler';
import MyAutoBookings from './MyAutoBookings';
import { useAuth } from '../context/AuthContext';
import * as api from '../api';
import { useQuery, useQueryClient } from '@tanstack/react-query';

function AutoBookingPage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  // 1. Fetch My Auto Bookings
  const { data: autoBookings = [], isLoading: loadingBookings, error: errorBookings } = useQuery({
    queryKey: ['autoBookings'],
    queryFn: () => api.getAutoBookings(token),
    enabled: !!token,
  });

  // 2. Fetch Static Classes (Schedule)
  const { data: staticClasses = {}, isLoading: loadingStatic, error: errorStatic } = useQuery({
    queryKey: ['staticClasses'],
    queryFn: () => api.getStaticClasses(token),
    enabled: !!token,
  });

  const loading = loadingBookings || loadingStatic;
  const error = errorBookings || errorStatic;

  const handleActionSuccess = () => {
    queryClient.invalidateQueries(['autoBookings']);
  };

  if (error) {
    return (
      <div className="p-6 bg-white border border-red-100 rounded-2xl shadow-sm text-center">
        <h3 className="text-lg font-bold text-red-700 mb-2">Error</h3>
        <p className="text-gray-500 mb-4">{error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }

  return loading ? (
    <div className="flex flex-col items-center justify-center p-20 text-brand-muted space-y-4">
      <div className="w-12 h-12 border-4 border-brand-red-light border-t-brand-red rounded-full animate-spin"></div>
      <p className="font-medium">Loading automation data...</p>
    </div>
  ) : (
    <div className="mb-20">
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-extrabold text-brand-dark mb-2 tracking-tight">Auto Booking</h1>
        <p className="text-brand-muted text-lg">Put your gym schedule on autopilot. GABS handles the rest. Choose the day of the week and the class you want to book. Then click on &quot;Add Auto-Book&quot; button.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Col: Active Auto Bookings */}
        <div className="lg:col-span-12 xl:col-span-6">
          <h3 className="text-xl font-bold text-brand-dark mb-4 flex items-center">
            Active Auto-Bookings
            <span className="ml-3 bg-brand-dark text-white text-xs font-bold px-2.5 py-1 rounded-full">{autoBookings.length}</span>
          </h3>
          <MyAutoBookings
            autoBookings={autoBookings}
            staticClasses={staticClasses}
            onActionSuccess={handleActionSuccess}
          />
        </div>

        {/* Right Col: Scheduler */}
        <div className="lg:col-span-12 xl:col-span-6">
          <h3 className="text-xl font-bold text-brand-dark mb-4">Schedule New Auto-Booking</h3>
          <AutoBookingScheduler
            staticClasses={staticClasses}
            onActionSuccess={handleActionSuccess}
          />
        </div>
      </div>
    </div>
  );
}

export default AutoBookingPage;
