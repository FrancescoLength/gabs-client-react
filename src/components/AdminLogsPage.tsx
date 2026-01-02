import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import * as api from '../api';
import { Shield, Activity, List, Clock, Bell, Database, RefreshCw, Terminal, Server, AlertCircle } from 'lucide-react';

const AdminLogsPage = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('status');

  // Data States
  // Data States
  interface AdminData {
    logs: any[];
    autoBookings: any[];
    liveBookings: any[];
    pushSubscriptions: any[];
    sessions: any[];
    status: any | null;
  }

  const [data, setData] = useState<AdminData>({
    logs: [],
    autoBookings: [],
    liveBookings: [],
    pushSubscriptions: [],
    sessions: [],
    status: null
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [logFilter, setLogFilter] = useState('ALL');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      setError(null);
      let newData = {};

      switch (activeTab) {
        case 'logs': {
          if (token) {
            const { logs } = await api.getAdminLogs(token);
            newData = { logs };
          }
          break;
        }
        case 'autoBookings':
          if (token) newData = { autoBookings: await api.getAdminAutoBookings(token) };
          break;
        case 'pushSubscriptions':
          if (token) newData = { pushSubscriptions: await api.getAdminPushSubscriptions(token) };
          break;
        case 'liveBookings':
          if (token) newData = { liveBookings: await api.getAdminLiveBookings(token) };
          break;
        case 'sessions':
          if (token) newData = { sessions: await api.getAdminSessions(token) };
          break;
        case 'status':
          if (token) newData = { status: await api.getAdminStatus(token) };
          break;
        default:
          break;
      }
      setData(prev => ({ ...prev, ...newData }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, activeTab]);

  useEffect(() => {
    fetchData();
    let interval: ReturnType<typeof setInterval>;
    if (autoRefresh) {
      interval = setInterval(fetchData, 5000);
    }
    return () => clearInterval(interval);
  }, [fetchData, autoRefresh]);

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

  const renderContent = () => {
    if (loading && !((data as any)[activeTab]?.length) && !data.status) {
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
            <p className="text-red-600 font-medium">{error}</p>
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
        const filteredLogs = data.logs.filter((log: any) => {
          if (logFilter === 'ALL') return true;
          return log.level === logFilter;
        });

        return (
          <div className="bg-white rounded-2xl shadow-float overflow-hidden border border-gray-100">
            <div className="p-4 border-b border-gray-100 flex items-center space-x-2 bg-gray-50/50">
              <span className="text-xs font-semibold text-gray-500 uppercase mr-2">Filter:</span>
              {['ALL', 'INFO', 'WARNING', 'ERROR'].map(level => (
                <button
                  key={level}
                  onClick={() => setLogFilter(level)}
                  className={`
                           px-3 py-1 rounded-lg text-xs font-bold transition-all
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
              {filteredLogs.length > 0 ? filteredLogs.map((log: any, index: number) => (
                <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${getLevelColor(log.level)}`}>
                      {log.level}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">{log.timestamp}</span>
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
          if (activeTab === 'autoBookings') return ['ID', 'User', 'Class', 'Time', 'Day', 'Status', 'Attempts'];
          if (activeTab === 'liveBookings') return ['ID', 'User', 'Class', 'Date', 'Time', 'Reminder', 'AutoID'];
          if (activeTab === 'pushSubscriptions') return ['ID', 'User', 'Endpoint', 'Created'];
          if (activeTab === 'sessions') return ['User', 'Updated', 'Session Data'];
          return [];
        };

        const renderRow = (item: any) => {
          if (activeTab === 'autoBookings') return (
            <>
              <td className="px-6 py-4 font-mono text-xs text-gray-500">{item.id}</td>
              <td className="px-6 py-4 font-medium text-gray-900">{item.username}</td>
              <td className="px-6 py-4 text-brand-dark">{item.class_name}</td>
              <td className="px-6 py-4 text-gray-600">{item.target_time}</td>
              <td className="px-6 py-4"><span className="px-2 py-1 bg-brand-red-light/20 text-brand-red text-xs font-bold rounded-md">{item.day_of_week}</span></td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.status === 'pending' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {item.status}
                </span>
              </td>
              <td className="px-6 py-4 text-gray-500">{item.retry_count}</td>
            </>
          );
          if (activeTab === 'liveBookings') return (
            <>
              <td className="px-6 py-4 font-mono text-xs text-gray-500">{item.id}</td>
              <td className="px-6 py-4 font-medium text-gray-900">{item.username}</td>
              <td className="px-6 py-4 text-brand-dark">{item.class_name}</td>
              <td className="px-6 py-4 text-gray-600">{item.class_date}</td>
              <td className="px-6 py-4 text-gray-600">{item.class_time}</td>
              <td className="px-6 py-4 text-gray-500">{item.reminder_sent ? '✅' : '⏳'}</td>
              <td className="px-6 py-4 font-mono text-xs text-gray-400">{item.auto_booking_id || '-'}</td>
            </>
          );
          if (activeTab === 'pushSubscriptions') return (
            <>
              <td className="px-6 py-4 font-mono text-xs text-gray-500">{item.id}</td>
              <td className="px-6 py-4 font-medium text-gray-900">{item.username}</td>
              <td className="px-6 py-4 font-mono text-xs text-gray-500 truncate max-w-xs" title={item.endpoint}>{item.endpoint}</td>
              <td className="px-6 py-4 text-gray-500 text-xs">{new Date(Number(item.created_at) * 1000).toLocaleString()}</td>
            </>
          );
          if (activeTab === 'sessions') return (
            <>
              <td className="px-6 py-4 font-medium text-gray-900">{item.username}</td>
              <td className="px-6 py-4 text-gray-500 text-xs">{new Date(Number(item.updated_at) * 1000).toLocaleString()}</td>
              <td className="px-6 py-4 font-mono text-xs text-gray-400 truncate max-w-md" title={JSON.stringify(item.session_data)}>{JSON.stringify(item.session_data)}</td>
            </>
          );
          // ... other cases can be handled similarly or generically
          return <td colSpan={100} className="px-6 py-4 text-gray-500">{JSON.stringify(item)}</td>;
        };

        const list = (data as any)[activeTab] || [];

        return (
          <div className="bg-white rounded-2xl shadow-float overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider text-xs border-b border-gray-100">
                  <tr>
                    {getColumns().map(header => (
                      <th key={header} className="px-6 py-3 whitespace-nowrap">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {list.map((item: any, idx: number) => (
                    <tr key={item.id || idx} className="hover:bg-gray-50/50 transition-colors">
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
