import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../api';
import { LogEntry, AutoBooking, LiveBooking, PushSubscriptionRecord, SessionRecord, SystemStatus } from '../../types';
import { Shield, Activity, List, Clock, Bell, Database, RefreshCw, Terminal, Server, AlertCircle } from 'lucide-react';

const AdminLogsPage = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('status');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const [autoRefresh, setAutoRefresh] = useState(false);
  const [logFilter, setLogFilter] = useState('ALL');

  interface AdminData {
    logs: LogEntry[];
    autoBookings: AutoBooking[];
    liveBookings: LiveBooking[];
    pushSubscriptions: PushSubscriptionRecord[];
    sessions: SessionRecord[];
    status: SystemStatus | null;
  }

  // React Query Hooks
  const { data: logsData, isLoading: loadingLogs, error: errorLogs } = useQuery({
    queryKey: ['adminLogs'],
    queryFn: () => api.getAdminLogs(),
    enabled: activeTab === 'logs' && !!token,
    refetchInterval: autoRefresh ? 5000 : false
  });

  const { data: autoBookings = [], isLoading: loadingAuto, error: errorAuto } = useQuery({
    queryKey: ['adminAutoBookings'],
    queryFn: () => api.getAdminAutoBookings(),
    enabled: activeTab === 'autoBookings' && !!token,
    refetchInterval: autoRefresh ? 5000 : false
  });

  const { data: liveBookings = [], isLoading: loadingLive, error: errorLive } = useQuery({
    queryKey: ['adminLiveBookings'],
    queryFn: () => api.getAdminLiveBookings(),
    enabled: activeTab === 'liveBookings' && !!token,
    refetchInterval: autoRefresh ? 5000 : false
  });

  const { data: pushSubscriptions = [], isLoading: loadingPush, error: errorPush } = useQuery({
    queryKey: ['adminPushSubscriptions'],
    queryFn: () => api.getAdminPushSubscriptions(),
    enabled: activeTab === 'pushSubscriptions' && !!token,
    refetchInterval: autoRefresh ? 5000 : false
  });

  const { data: sessions = [], isLoading: loadingSessions, error: errorSessions } = useQuery({
    queryKey: ['adminSessions'],
    queryFn: () => api.getAdminSessions(),
    enabled: activeTab === 'sessions' && !!token,
    refetchInterval: autoRefresh ? 5000 : false
  });

  const { data: status, isLoading: loadingStatus, error: errorStatus } = useQuery({
    queryKey: ['adminStatus'],
    queryFn: () => api.getAdminStatus(),
    enabled: activeTab === 'status' && !!token,
    refetchInterval: autoRefresh ? 5000 : false
  });

  // Consolidated loading / error handling
  const loading = loadingLogs || loadingAuto || loadingLive || loadingPush || loadingSessions || loadingStatus;

  // Aggregate data for rendering
  const data: AdminData = {
    logs: logsData?.logs || [],
    autoBookings,
    liveBookings,
    pushSubscriptions,
    sessions,
    status: status || null
  };

  // Find first error if any
  const error = errorLogs || errorAuto || errorLive || errorPush || errorSessions || errorStatus;
  const errorMessage = error instanceof Error ? error.message : (error ? 'Error loading data' : null);

  const tabs = [
    { id: 'status', label: 'System Status', icon: <Activity size={18} /> },
    { id: 'logs', label: 'App Logs', icon: <List size={18} /> },
    { id: 'autoBookings', label: 'Auto Bookings', icon: <Clock size={18} /> },
    { id: 'liveBookings', label: 'Live Bookings', icon: <Database size={18} /> },
    { id: 'pushSubscriptions', label: 'Push Subs', icon: <Bell size={18} /> },
    { id: 'sessions', label: 'Sessions', icon: <Shield size={18} /> },
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'INFO': return 'text-blue-600 bg-blue-50';
      case 'WARNING': return 'text-orange-600 bg-orange-50';
      case 'ERROR':
      case 'CRITICAL': return 'text-red-600 bg-red-50 font-bold';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Helper functions
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (timestamp: number) => {
    try {
      const date = new Date(timestamp * 1000);
      return new Intl.DateTimeFormat('en-GB', { 
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      }).format(date);
    } catch {
      return String(timestamp);
    }
  };

  const formatLogDate = (timestamp: string) => {
      // Backend format is typically "2025-11-25 00:00:01,289" (ISO-like but with comma and space)
      // Input: "yyyy-MM-dd HH:mm:ss,SSS"
      // Output: "dd/MM/yyyy HH:mm:ss,SSS"
      try {
          const [datePart, timePart] = timestamp.split(' ');
          const [year, month, day] = datePart.split('-');
          return `${day}/${month}/${year} ${timePart}`;
      } catch {
          return timestamp;
      }
  };

  const getBookingDay = (day: string) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const idx = days.indexOf(day);
    if (idx === -1) return '-';
    // Subtract 2 days, handling wrap-around
    const bookingDayIdx = (idx - 2 + 7) % 7;
    return days[bookingDayIdx];
  };

  const getLastSessionUpdate = () => {
      if (!sessions || sessions.length === 0) return null;
      const timestamps = sessions.map(s => s.updated_at);
      const maxTime = Math.max(...timestamps);
      return formatDateTime(maxTime);
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const renderContent = () => {
    const currentData = data[activeTab as keyof AdminData];
    const hasData = Array.isArray(currentData) ? currentData.length > 0 : !!data.status;

    if (loading && !hasData) {
      return (
        <div className="flex flex-col items-center justify-center p-20 text-brand-muted space-y-4">
          <div className="w-10 h-10 border-4 border-brand-red-light border-t-brand-red rounded-full animate-spin"></div>
          <p className="font-medium">Loading admin data...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-xl bg-red-50 p-6 border border-red-100 flex items-center shadow-sm">
          <AlertCircle className="text-red-600 mr-4" size={24} />
          <div>
            <h3 className="text-red-800 font-bold">Error Loading Data</h3>
            <p className="text-red-600 font-medium">{errorMessage}</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'status':
        return data.status ? (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-white p-6 rounded-2xl shadow-float border border-white/50">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                  <Server size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">System Health</h3>
                  <p className="text-sm text-gray-500">Core services status</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-600">Status</span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold shadow-sm">
                    {data.status.status}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-600">Uptime</span>
                  <span className="font-mono text-gray-800 font-bold">{data.status.uptime}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-600">Last Session Update</span>
                  <span className="font-mono text-gray-800 font-bold">{getLastSessionUpdate() || 'N/A'}</span>
                </div>
              </div>
            </div>

            {data.status.ssh_tunnel_command && (
              <div className="bg-brand-dark p-6 rounded-2xl shadow-float text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Terminal size={64} />
                </div>
                <h3 className="text-lg font-bold mb-4 flex items-center">
                  <Terminal size={20} className="mr-2 text-brand-red" />
                  SSH Tunnel
                </h3>
                <div className="bg-black/30 p-4 rounded-xl font-mono text-xs text-green-400 break-all border border-white/10">
                  {data.status.ssh_tunnel_command}
                </div>
              </div>
            )}
          </div>
        ) : null;

      case 'logs': {
        const filteredLogs = data.logs.filter((log: LogEntry) => {
          if (logFilter === 'ALL') return true;
          return log.level === logFilter;
        });

        return (
          <div className="bg-white rounded-2xl shadow-float overflow-hidden border border-gray-100">
            <div className="p-4 border-b border-gray-100 flex items-center space-x-2 bg-gray-50/50 overflow-x-auto no-scrollbar">
              <span className="text-xs font-semibold text-gray-500 uppercase mr-2 whitespace-nowrap flex-shrink-0"> </span>
              {['ALL', 'INFO', 'WARNING', 'ERROR'].map(level => (
                <button
                  key={level}
                  onClick={() => setLogFilter(level)}
                  className={`
                           px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex-shrink-0
                           ${logFilter === level
                      ? (level === 'ERROR' ? 'bg-red-100 text-red-700' : level === 'WARNING' ? 'bg-orange-100 text-orange-700' : 'bg-brand-dark text-white')
                      : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'}
                        `}
                >
                  {level}
                </button>
              ))}
            </div>
            <div className="max-h-[600px] overflow-y-auto divide-y divide-gray-100">
              {filteredLogs.length > 0 ? filteredLogs.map((log: LogEntry, index: number) => (
                <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${getLevelColor(log.level)}`}>
                      {log.level}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">{formatLogDate(log.timestamp)}</span>
                  </div>
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono break-all pl-2 border-l-2 border-gray-200">
                    {log.message}
                  </pre>
                </div>
              )) : (
                <div className="p-8 text-center text-gray-400 italic">No logs found for this filter</div>
              )}
            </div>
          </div>
        );
      }

      case 'autoBookings':
      case 'liveBookings':
      case 'pushSubscriptions':
      case 'sessions': {
        const getColumns = () => {
            if (activeTab === 'autoBookings') return [
                { label: 'ID', key: 'id' },
                { label: 'User', key: 'username' },
                { label: 'Class', key: 'class_name' },
                { label: 'Time', key: 'target_time' },
                { label: 'Day', key: 'day_of_week' },
                { label: 'Booking Day', key: 'booking_day' }, // Computed
                { label: 'Status', key: 'status' },
                { label: 'Attempts', key: 'retry_count' }
            ];
            if (activeTab === 'liveBookings') return [
                { label: 'ID', key: 'id' },
                { label: 'User', key: 'username' },
                { label: 'Class', key: 'class_name' },
                { label: 'Date', key: 'class_date' },
                { label: 'Time', key: 'class_time' },
                { label: 'Reminder', key: 'reminder_sent' },
                { label: 'AutoID', key: 'auto_booking_id' }
            ];
            if (activeTab === 'pushSubscriptions') return [
                { label: 'ID', key: 'id' },
                { label: 'User', key: 'username' },
                { label: 'Endpoint', key: 'endpoint' },
                { label: 'Created', key: 'created_at' }
            ];
            if (activeTab === 'sessions') return [
                { label: 'User', key: 'username' },
                { label: 'Updated', key: 'updated_at' },
                { label: 'Session Data', key: 'session_data' }
            ];
            return [];
        };

        const renderRow = (item: unknown) => {
          if (activeTab === 'autoBookings') {
            const booking = item as AutoBooking;
            return (
              <>
                <td className="px-6 py-4 font-mono text-xs text-gray-500">{booking.id}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{booking.username}</td>
                <td className="px-6 py-4 text-brand-dark">{booking.class_name}</td>
                <td className="px-6 py-4 text-gray-600">{booking.target_time}</td>
                <td className="px-6 py-4"><span className="px-2 py-1 bg-brand-red-light/20 text-brand-red text-xs font-bold rounded-md">{booking.day_of_week}</span></td>
                <td className="px-6 py-4 text-gray-500 text-xs">{getBookingDay(booking.day_of_week)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${booking.status === 'pending' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {booking.status}
                  </span>
                </td>
                <td className="px-6 py-4 font-mono text-xs text-gray-500 text-center">
                    {booking.retry_count || 0}
                </td>
              </>
            );
          }
          if (activeTab === 'liveBookings') {
            const booking = item as LiveBooking;
            return (
              <>
                <td className="px-6 py-4 font-mono text-xs text-gray-500">{booking.id}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{booking.username}</td>
                <td className="px-6 py-4 text-brand-dark">{booking.class_name}</td>
                <td className="px-6 py-4 text-gray-600">{formatDate(booking.class_date)}</td>
                <td className="px-6 py-4 text-gray-600">
                  {booking.created_at ? booking.created_at.split(' ')[1] : booking.class_time}
                </td>
                <td className="px-6 py-4 text-gray-500">{booking.reminder_sent ? '✅' : '⏳'}</td>
                <td className="px-6 py-4 font-mono text-xs text-gray-400">{booking.auto_booking_id || '-'}</td>
              </>
            );
          }
          if (activeTab === 'pushSubscriptions') {
            const sub = item as PushSubscriptionRecord;
            return (
              <>
                <td className="px-6 py-4 font-mono text-xs text-gray-500">{sub.id}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{sub.username}</td>
                <td className="px-6 py-4 font-mono text-xs text-gray-500 truncate max-w-xs" title={sub.endpoint}>{sub.endpoint}</td>
                <td className="px-6 py-4 text-gray-500 text-xs">{formatDateTime(sub.created_at)}</td>
              </>
            );
          }
          if (activeTab === 'sessions') {
            const session = item as SessionRecord;
            return (
              <>
                <td className="px-6 py-4 font-medium text-gray-900">{session.username}</td>
                <td className="px-6 py-4 text-gray-500 text-xs">{formatDateTime(session.updated_at)}</td>
                <td className="px-6 py-4 font-mono text-xs text-gray-400 truncate max-w-md" title={JSON.stringify(session.session_data)}>{JSON.stringify(session.session_data)}</td>
              </>
            );
          }
          // Fallback
          return <td colSpan={100} className="px-6 py-4 text-gray-500">{JSON.stringify(item)}</td>;
        };

        let list: any[] = [];
        if (activeTab === 'autoBookings') list = data.autoBookings;
        else if (activeTab === 'liveBookings') list = data.liveBookings;
        else if (activeTab === 'pushSubscriptions') list = data.pushSubscriptions;
        else if (activeTab === 'sessions') list = data.sessions;

        // Sorting
        if (sortConfig !== null) {
          list = [...list].sort((a, b) => {
            let valA = a[sortConfig.key];
            let valB = b[sortConfig.key];

            // Special handling for computed columns
            if (activeTab === 'autoBookings' && sortConfig.key === 'booking_day') {
                valA = getBookingDay(a.day_of_week);
                valB = getBookingDay(b.day_of_week);
            }

            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
          });
        }

        return (
          <div className="bg-white rounded-2xl shadow-float overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider text-xs border-b border-gray-100">
                  <tr>
                    {getColumns().map(col => (
                      <th 
                        key={col.key} 
                        className="px-6 py-3 whitespace-nowrap cursor-pointer hover:bg-gray-100 transition-colors select-none"
                        onClick={() => handleSort(col.key)}
                      >
                        <div className="flex items-center">
                            {col.label}
                            <span className="ml-1">
                                {sortConfig?.key === col.key ? (
                                    sortConfig.direction === 'asc' ? '↑' : '↓'
                                ) : (
                                    <span className="text-gray-300">↕</span>
                                )}
                            </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {list.map((item: unknown, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      {renderRow(item)}
                    </tr>
                  ))}
                  {list.length === 0 && (
                    <tr>
                      <td colSpan={100} className="px-6 py-8 text-center text-gray-400 italic">No records found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="mb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark mb-1 flex items-center">
            <Shield className="mr-3 text-brand-red" size={32} />
            Admin Dashboard
          </h1>
          <p className="text-gray-500">Monitor system health and logs.</p>
        </div>

        <button
          onClick={() => setAutoRefresh(!autoRefresh)}
          className={`flex items-center px-4 py-2 rounded-xl transition-all font-medium border ${autoRefresh ? 'bg-brand-red text-white border-brand-red shadow-lg shadow-brand-red/30' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
        >
          <RefreshCw size={18} className={`mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
          {autoRefresh ? 'Auto-Refresh ON' : 'Auto-Refresh OFF'}
        </button>
      </div>

      <div className="flex overflow-x-auto pb-4 mb-4 gap-2 no-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
                    flex items-center px-4 py-2.5 rounded-xl whitespace-nowrap transition-all duration-200 font-bold text-sm
                    ${activeTab === tab.id
                ? 'bg-brand-dark text-white shadow-lg shadow-brand-dark/20'
                : 'bg-white text-gray-500 hover:text-brand-dark hover:bg-gray-50 border border-transparent hover:border-gray-200'}
                `}
          >
            <span className={`mr-2 ${activeTab === tab.id ? 'text-brand-red' : 'text-gray-400'}`}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="animate-fade-in min-h-[400px]">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminLogsPage;
