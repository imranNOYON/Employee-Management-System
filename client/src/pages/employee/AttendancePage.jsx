import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { format, differenceInMinutes } from 'date-fns';

export default function AttendancePage() {
  const [attendance, setAttendance] = useState({
    status: 'loading',
    clockIn: null,
    clockOut: null,
    totalMinutes: null,
    todayRecord: null
  });
  const [loading, setLoading] = useState(false);
  const [recentRecords, setRecentRecords] = useState([]);
  const [error, setError] = useState(null);

  const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      'Cache-Control': 'no-cache'
    },
    timeout: 10000
  });

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [todayRes, historyRes] = await Promise.all([
        api.get('/attendance'),
        api.get('/attendance/history?limit=5')
      ]);

      // Fixed: Handle response structure properly
      const todayData = todayRes.data.success ? (todayRes.data.records || todayRes.data.data || []) : [];
      const historyData = historyRes.data.success ? (historyRes.data.records || historyRes.data.data || []) : [];

      setRecentRecords(historyData);

      const today = format(new Date(), 'yyyy-MM-dd');
      const todayRecord = todayData.find(r => r.date === today);

      if (!todayRecord) {
        setAttendance({
          status: 'not_marked',
          clockIn: null,
          clockOut: null,
          totalMinutes: null,
          todayRecord: null
        });
        return;
      }

      // Determine status based on clock in/out
      let status = 'not_marked';
      if (todayRecord.clockOut) {
        status = 'clocked_out';
      } else if (todayRecord.clockIn) {
        status = 'clocked_in';
      }

      const totalMinutes = todayRecord.totalMinutes || 
        (todayRecord.clockIn && todayRecord.clockOut 
          ? differenceInMinutes(new Date(todayRecord.clockOut), new Date(todayRecord.clockIn))
          : null);

      setAttendance({
        status,
        clockIn: todayRecord.clockIn,
        clockOut: todayRecord.clockOut,
        totalMinutes,
        todayRecord
      });
    } catch (error) {
      console.error('Fetch error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to load attendance data';
      setError(errorMessage);
      toast.error(errorMessage);
      setAttendance(prev => ({ ...prev, status: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const handleClockIn = async () => {
    try {
      setLoading(true);
      const response = await api.post('/attendance/clock-in');
      
      if (response.data.success) {
        toast.success(response.data.message || 'Clocked in successfully');
        await fetchAttendanceData();
      } else {
        throw new Error(response.data.message || 'Clock in failed');
      }
    } catch (error) {
      console.error('Clock in error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Clock in failed';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    try {
      setLoading(true);
      const response = await api.post('/attendance/clock-out');
      
      if (response.data.success) {
        toast.success(response.data.message || 'Clocked out successfully');
        await fetchAttendanceData();
      } else {
        throw new Error(response.data.message || 'Clock out failed');
      }
    } catch (error) {
      console.error('Clock out error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Clock out failed';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      return format(date, 'hh:mm a');
    } catch (error) {
      console.error('Time formatting error:', error);
      return '-';
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes || isNaN(minutes)) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      // Handle YYYY-MM-DD format from backend
      if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const [year, month, day] = dateString.split('-');
        return format(new Date(year, month - 1, day), 'MMM dd, yyyy');
      }
      const date = new Date(dateString);
      return format(date, 'MMM dd, yyyy');
    } catch (error) {
      console.error('Date formatting error:', error);
      return dateString;
    }
  };

  const getStatusDisplay = () => {
    switch (attendance.status) {
      case 'clocked_in':
        return { text: 'Clocked In', color: 'text-yellow-600' };
      case 'clocked_out':
        return { text: 'Clocked Out', color: 'text-green-600' };
      case 'not_marked':
        return { text: 'Not Marked', color: 'text-gray-600' };
      case 'loading':
        return { text: 'Loading...', color: 'text-blue-600' };
      case 'error':
        return { text: 'Error', color: 'text-red-600' };
      default:
        return { text: 'Unknown', color: 'text-gray-600' };
    }
  };

  const statusDisplay = getStatusDisplay();

  // Error boundary component
  if (error && attendance.status === 'error') {
    return (
      <div className="min-h-screen bg-gray-100 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <div className="text-red-500 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.312 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Attendance</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchAttendanceData}
                disabled={loading}
                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Retrying...' : 'Try Again'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Today's Attendance</h2>
              <button
                onClick={fetchAttendanceData}
                disabled={loading}
                className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                title="Refresh"
              >
                <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Status Information */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-600">Status:</span>
                  <span className={`font-semibold ${statusDisplay.color}`}>
                    {statusDisplay.text}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-600">Clock In:</span>
                  <span className="text-gray-900">{formatTime(attendance.clockIn)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-600">Clock Out:</span>
                  <span className="text-gray-900">{formatTime(attendance.clockOut)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-600">Total Time:</span>
                  <span className="text-gray-900 font-semibold">{formatDuration(attendance.totalMinutes)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col justify-center space-y-4">
                <button
                  onClick={handleClockIn}
                  disabled={attendance.status !== 'not_marked' || loading}
                  className={`w-full py-3 px-4 rounded-md text-white font-medium transition-colors ${
                    attendance.status !== 'not_marked' || loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 active:bg-green-800'
                  }`}
                >
                  {loading && attendance.status === 'not_marked' ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    'Clock In'
                  )}
                </button>
                
                <button
                  onClick={handleClockOut}
                  disabled={attendance.status !== 'clocked_in' || loading}
                  className={`w-full py-3 px-4 rounded-md text-white font-medium transition-colors ${
                    attendance.status !== 'clocked_in' || loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                  }`}
                >
                  {loading && attendance.status === 'clocked_in' ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    'Clock Out'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Recent Attendance History */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Attendance</h3>
            {recentRecords.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Clock In
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Clock Out
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentRecords.map(record => (
                      <tr key={record._id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(record.date)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatTime(record.clockIn)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatTime(record.clockOut)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDuration(record.totalMinutes)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No recent records</h3>
                <p className="mt-1 text-sm text-gray-500">No recent attendance records found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}