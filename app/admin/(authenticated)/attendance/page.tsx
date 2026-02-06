'use client';

import { useEffect, useState } from 'react';
import { Calendar, Download, Filter, Loader2, Clock, MapPin, User } from 'lucide-react';

interface AttendanceRecord {
    _id: string;
    user: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        profileImage?: string;
    };
    date: string;
    checkIn: string;
    checkOut?: string;
    checkInLocation: {
        locationName: string;
        distance: number;
    };
    status: 'checked-in' | 'checked-out';
    workHours?: number;
}

export default function AdminAttendancePage() {
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        fetchAttendance();
    }, [dateFilter]);

    const fetchAttendance = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (dateFilter) params.append('date', dateFilter);

            const res = await fetch(`/api/admin/attendance?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                setAttendance(data.data);
            }
        } catch (error) {
            console.error('Error fetching attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            // Helper function to safely format time
            const formatTimeForExport = (dateValue: string | Date | undefined | null): string => {
                if (!dateValue) return 'N/A';
                try {
                    const date = new Date(dateValue);
                    if (isNaN(date.getTime())) return 'N/A';
                    return date.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: true
                    });
                } catch {
                    return 'N/A';
                }
            };

            // Helper function to safely format date
            const formatDateForExport = (dateValue: string | Date | undefined | null): string => {
                if (!dateValue) return 'N/A';
                try {
                    const date = new Date(dateValue);
                    if (isNaN(date.getTime())) return 'N/A';
                    return date.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    });
                } catch {
                    return 'N/A';
                }
            };

            // Create CSV content
            const headers = ['Employee', 'Email', 'Date', 'Check In', 'Check Out', 'Location', 'Work Hours', 'Status'];
            const rows = attendance.map(record => [
                `${record.user?.firstName || ''} ${record.user?.lastName || ''}`.trim() || 'N/A',
                record.user?.email || 'N/A',
                formatDateForExport(record.date),
                formatTimeForExport(record.checkIn),
                record.checkOut ? formatTimeForExport(record.checkOut) : 'Not checked out',
                record.checkInLocation?.locationName || 'N/A',
                record.workHours ? record.workHours.toFixed(2) : 'N/A',
                record.status === 'checked-out' ? 'Completed' : 'In Progress',
            ]);

            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            ].join('\n');

            // Download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `attendance-${dateFilter}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            alert('Failed to export attendance');
        } finally {
            setExporting(false);
        }
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
    };

    // Summary stats
    const totalCheckedIn = attendance.filter(a => a.status === 'checked-in').length;
    const totalCheckedOut = attendance.filter(a => a.status === 'checked-out').length;
    const avgHours = attendance.length > 0
        ? attendance.filter(a => a.workHours).reduce((sum, a) => sum + (a.workHours || 0), 0) /
        attendance.filter(a => a.workHours).length || 0
        : 0;

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Attendance Records</h1>
                    <p className="text-gray-500 mt-1">View and export employee attendance</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#05033e] focus:border-transparent"
                        />
                    </div>
                    <button
                        onClick={handleExport}
                        disabled={exporting || attendance.length === 0}
                        className="px-4 py-2 bg-[#05033e] text-white rounded-lg hover:bg-blue-900 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        <Download className="w-4 h-4" />
                        {exporting ? 'Exporting...' : 'Export CSV'}
                    </button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-100 rounded-xl">
                            <User className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Records</p>
                            <p className="text-2xl font-bold text-gray-900">{attendance.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-yellow-100 rounded-xl">
                            <Clock className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Still Working</p>
                            <p className="text-2xl font-bold text-gray-900">{totalCheckedIn}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-xl">
                            <Clock className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Avg. Work Hours</p>
                            <p className="text-2xl font-bold text-gray-900">{avgHours.toFixed(1)}h</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Attendance Table */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-[#05033e]" />
                </div>
            ) : attendance.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                    <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No attendance records for this date</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check In</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check Out</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Work Hours</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {attendance.map((record) => (
                                    <tr key={record._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-[#05033e] rounded-full flex items-center justify-center text-white font-medium">
                                                    {record.user?.firstName?.[0] || 'E'}{record.user?.lastName?.[0] || ''}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {record.user?.firstName || 'Unknown'} {record.user?.lastName || ''}
                                                    </p>
                                                    <p className="text-sm text-gray-500">{record.user?.email || 'N/A'}</p>
                                                    <a href={`/admin/attendance/user/${record.user?._id}`} className="text-xs text-blue-600 hover:underline mt-1 inline-block">
                                                        View Calendar
                                                    </a>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900">{formatTime(record.checkIn)}</p>
                                            <p className="text-sm text-gray-500">{formatDate(record.date)}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            {record.checkOut ? (
                                                <p className="font-medium text-gray-900">{formatTime(record.checkOut)}</p>
                                            ) : (
                                                <span className="text-yellow-600">Still working</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4 text-gray-400" />
                                                <span className="text-gray-700">{record.checkInLocation?.locationName || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {record.workHours ? (
                                                <span className="font-medium text-gray-900">{record.workHours.toFixed(1)}h</span>
                                            ) : (
                                                <span className="text-gray-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${record.status === 'checked-out'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {record.status === 'checked-out' ? 'Completed' : 'In Progress'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
