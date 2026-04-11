import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../api';
import { LogEntry, AutoBooking, LiveBooking, PushSubscriptionRecord, SessionRecord, SystemStatus } from '../../types';
import { Shield, Activity, List, Clock, Bell, Database, RefreshCw, Terminal, Server, AlertCircle, Power } from 'lucide-react';

const AdminLogsPage = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('status');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const [autoRefresh, setAutoRefresh] = useState(false);
  const [logFilter, setLogFilter] = useState('ALL');
  const [tcpToggling, setTcpToggling] = useState(false);

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

  const { data: tcpStatus, isLoading: loadingTcp } = useQuery({
    queryKey: ['ngrokTcpStatus'],
    queryFn: () => api.getNgrokTcpStatus(),
    enabled: activeTab === 'status' && !!token,
    refetchInterval: autoRefresh ? 5000 : false
  });

  const handleTcpToggle = async () => {
    setTcpToggling(true);
    try {
      await api.toggleNgrokTcp();
      await queryClient.invalidateQueries({ queryKey: ['ngrokTcpStatus'] });
      await queryClient.invalidateQueries({ queryKey: ['adminStatus'] });
    } catch (e) {
      console.error('Failed to toggle ngrok TCP tunnel:', e);
    } finally {
      setTcpToggling(false);
    }
  };

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
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-600 flex items-center gap-2">
                    <Power size={14} />
                    SSH Tunnel (TCP)
                  </span>
                  <button
                    onClick={handleTcpToggle}
                    disabled={tcpToggling || loadingTcp}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold transition-all ${
                      tcpToggling || loadingTcp
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : tcpStatus?.active
                        ? 'bg-green-100 text-green-700 hover:bg-green-200 shadow-sm'
                        : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                    }`}
                  >
                    {tcpToggling || loadingTcp ? (
                      <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Power size={13} />
                    )}
                    {tcpStatus?.active ? 'ON' : 'OFF'}
                  </button>
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
        // Group logs by task_id if they have one
        const groupedLogs: Record<string, LogEntry[]> = {};
        const flatLogs: LogEntry[] = []; // Logs without task_id

        data.logs.forEach(log => {
          if (log.task_id) {
            if (!groupedLogs[log.task_id]) {
              groupedLogs[log.task_id] = [];
            }
            groupedLogs[log.task_id].push(log);
          } else {
            flatLogs.push(log);
          }
        });

        const filteredGroups = Object.entries(groupedLogs).filter(([, groupLogs]) => {
            const matchLevel = logFilter === 'ALL' || groupLogs.some(l => l.level === logFilter);
            return matchLevel;
        });

        const filteredFlatLogs = flatLogs.filter(log => {
            return logFilter === 'ALL' || log.level === logFilter;
        });

        const getScenarioColor = (scenario: string = '') => {
            switch(scenario) {
                case 'login': case 'logout': return 'bg-blue-100 text-blue-700 border-blue-200';
                case 'manual_booking': return 'bg-green-100 text-green-700 border-green-200';
                case 'manual_cancel': return 'bg-red-100 text-red-700 border-red-200';
                case 'auto_booking': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
                case 'cancellation_reminder': return 'bg-purple-100 text-purple-700 border-purple-200';
                case 'reset_failed': return 'bg-orange-100 text-orange-700 border-orange-200';
                case 'session_refresh': return 'bg-teal-100 text-teal-700 border-teal-200';
                default: return 'bg-gray-100 text-gray-700 border-gray-200';
            }
        };

        return (
          <div className="bg-white rounded-2xl shadow-float overflow-hidden border border-gray-100">
            <div className="p-4 border-b border-gray-100 flex flex-col space-y-3 bg-gray-50/50">
               <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar">
                <span className="text-xs font-semibold text-gray-500 uppercase mr-2 whitespace-nowrap flex-shrink-0">Level</span>
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
            </div>

            <div className="max-h-[600px] overflow-y-auto p-4 space-y-6">
              {filteredGroups.length === 0 && filteredFlatLogs.length === 0 && (
                 <div className="p-8 text-center text-gray-400 italic">No logs found for this filter</div>
              )}

              {/* Render Structured Task Groups */}
              {filteredGroups.map(([taskId, groupLogs]) => {
                  const ctx = groupLogs[0]; // Take context from first log
                  const startTime = new Date(groupLogs[0].timestamp.replace(',', '.'));
                  const endTime = new Date(groupLogs[groupLogs.length - 1].timestamp.replace(',', '.'));
                  const durationMs = Object.is(endTime.getTime(), NaN) || Object.is(startTime.getTime(), NaN) ? 0 : endTime.getTime() - startTime.getTime();
                  const durationStr = durationMs > 0 ? `${(durationMs / 1000).toFixed(1)}s` : '';

                  const hasError = groupLogs.some(l => l.level === 'ERROR' || l.level === 'CRITICAL');
                  const hasWarning = groupLogs.some(l => l.level === 'WARNING');
                  const borderClass = hasError ? 'border-red-200' : hasWarning ? 'border-orange-200' : 'border-gray-200';

                  return (
                      <div key={taskId} className={`rounded-xl border ${borderClass} bg-white shadow-sm overflow-hidden`}>
                          {/* Group Header */}
                          <div className={`p-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 ${hasError ? 'bg-red-50/50' : 'bg-gray-50'}`}>
                              <div className="flex items-center gap-3 flex-wrap">
                                  <span className={`text-xs font-bold px-2 py-1 rounded-md border uppercase tracking-wider ${getScenarioColor(ctx.scenario)}`}>
                                      {ctx.scenario || 'UNKNOWN'}
                                  </span>
                                  <span className="text-xs font-mono text-gray-400 bg-white px-2 py-0.5 rounded border border-gray-100">
                                      {taskId}
                                  </span>
                                  {ctx.user && <span className="text-sm font-semibold text-gray-700">{ctx.user}</span>}
                                  {ctx.class_name && (
                                      <span className="text-sm text-gray-600 flex items-center">
                                          <span className="mx-2 text-gray-300">•</span>
                                          <span className="font-medium text-brand-dark">{ctx.class_name}</span>
                                          {ctx.date && ctx.time && (
                                            <span className="ml-1 text-gray-500">
                                              @ {ctx.time} {ctx.date.split('-').reverse().join('/')}
                                            </span>
                                          )}
                                      </span>
                                  )}
                              </div>
                              <div className="flex items-center gap-3">
                                  {groupLogs[0].timestamp && (
                                    <span className="text-xs font-mono text-gray-400">
                                      {groupLogs[0].timestamp.split(' ')[0]?.split('-').reverse().join('/')}
                                    </span>
                                  )}
                                  {durationStr && <span className="text-xs font-mono text-gray-400">{durationStr}</span>}
                              </div>
                          </div>

                          {/* Log Lines */}
                          <div className="p-3 bg-gray-900 font-mono text-sm leading-relaxed overflow-x-auto">
                              {groupLogs.map((log, idx) => {
                                  let colorClass = 'text-gray-300';
                                  if (log.level === 'ERROR' || log.level === 'CRITICAL') colorClass = 'text-red-400 font-bold';
                                  else if (log.level === 'WARNING') colorClass = 'text-yellow-400';
                                  else if (log.message.includes('SUCCESS') || log.message.includes('✅')) colorClass = 'text-green-400 font-bold';

                                  const [datePart = '', timePart = ''] = log.timestamp.split(' ');
                                  const timeDisplay = timePart.split(',')[0];
                                  const dateDisplay = datePart.split('-').reverse().join('/');
                                  return (
                                      <div key={idx} className={`${colorClass} whitespace-pre-wrap flex gap-3 hover:bg-white/5 px-2 rounded`}>
                                          <span className="text-gray-600 flex-shrink-0 select-none">{dateDisplay}</span>
                                          <span className="text-gray-500 flex-shrink-0 select-none">{timeDisplay}</span>
                                          <span className={`flex-shrink-0 w-12 select-none ${log.level === 'INFO' ? 'text-blue-400' : ''}`}>{log.level}</span>
                                          <span className="break-all">{log.message}</span>
                                      </div>
                                  );
                              })}
                          </div>
                      </div>
                  );
              })}

              {/* Render Flat Legacy Logs (if any match the filter) */}
              {filteredFlatLogs.length > 0 && (
                  <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                      <div className="p-3 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
                          <span className="text-xs font-bold px-2 py-1 rounded-md border uppercase tracking-wider bg-gray-200 text-gray-600 border-gray-300">
                              LEGACY LOGS
                          </span>
                      </div>
                      <div className="p-3 bg-gray-900 font-mono text-sm leading-relaxed overflow-x-auto">
                          {filteredFlatLogs.map((log, idx) => {
                               let colorClass = 'text-gray-300';
                               if (log.level === 'ERROR' || log.level === 'CRITICAL') colorClass = 'text-red-400 font-bold';
                               else if (log.level === 'WARNING') colorClass = 'text-yellow-400';
                               const [datePart = '', timePart = ''] = log.timestamp ? log.timestamp.split(' ') : ['', ''];
                               const timeDisplay = timePart.split(',')[0];
                               const dateDisplay = datePart ? datePart.split('-').reverse().join('/') : '';

                               return (
                                  <div key={`flat-${idx}`} className={`${colorClass} whitespace-pre-wrap flex gap-3 hover:bg-white/5 px-2 rounded`}>
                                      {dateDisplay && <span className="text-gray-600 flex-shrink-0 select-none">{dateDisplay}</span>}
                                      {timeDisplay && <span className="text-gray-500 flex-shrink-0 select-none">{timeDisplay}</span>}
                                      {log.level !== 'RAW' && <span className={`flex-shrink-0 w-12 select-none ${log.level === 'INFO' ? 'text-blue-400' : ''}`}>{log.level}</span>}
                                      <span className="break-all">{log.message}</span>
                                  </div>
                              );
                          })}
                      </div>
                  </div>
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
