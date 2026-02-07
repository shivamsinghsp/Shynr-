'use client';

import { useEffect, useState, use } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle, XCircle, Clock } from 'lucide-react';
import Link from 'next/link';

interface AttendanceRecord {
    _id: string;
    date: string;
    checkIn: string;
    checkOut?: string;
    status: 'checked-in' | 'checked-out';
    workHours?: number;
}

export default function UserAttendanceCalendarPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: userId } = use(params);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    // Get current month details
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // 0-indexed

    // First day of month
    const firstDay = new Date(year, month, 1);
    // Last day of month
    const lastDay = new Date(year, month + 1, 0);
    // Days in month
    const daysInMonth = lastDay.getDate();
    // Starting day of week (0=Sun, 1=Mon...)
    const startDayOfWeek = firstDay.getDay();

    useEffect(() => {
        fetchData();
        fetchUser();
    }, [currentDate]);

    const fetchUser = async () => {
        try {
            // We assume a user details endpoint exists or we fetch from attendance list logic
            // providing a fallback since we don't have a direct single user API verified yet
            // Actually, we can fetch all users and find one, or update API. 
            // For now, let's just show ID if name fails, or implement a simple user fetch if needed.
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    }

    const fetchData = async () => {
        setLoading(true);
        try {
            // Format dates as YYYY-MM-DD
            // Start from 1st day of month
            const startDate = new Date(year, month, 1).toISOString();
            // End at last day of month
            const endDate = new Date(year, month + 1, 0).toISOString();

            const res = await fetch(`/api/admin/attendance?userId=${userId}&startDate=${startDate}&endDate=${endDate}`);
            const data = await res.json();

            if (data.success) {
                setAttendanceData(data.data);
            }
        } catch (error) {
            console.error('Error fetching attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const getDayStatus = (day: number) => {
        const dateStr = new Date(year, month, day).toISOString().split('T')[0];
        const record = attendanceData.find(a => a.date.startsWith(dateStr));
        const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
        const isPast = new Date(year, month, day) < new Date(new Date().setHours(0, 0, 0, 0));
        const isFuture = new Date(year, month, day) > new Date();

        if (isFuture) return { type: 'future' };

        if (record) {
            if (record.status === 'checked-out') {
                return { type: 'present', record }; // Green
            } else {
                // Checked in but not out
                if (isToday) return { type: 'ongoing', record }; // Yellow
                return { type: 'missed-checkout', record }; // Red (Missed checkout)
            }
        } else {
            if (isPast && !isToday) return { type: 'absent' }; // Red
            return { type: 'none' };
        }
    };

    const renderCalendarDays = () => {
        const days = [];

        // Empty cells for previous month
        for (let i = 0; i < startDayOfWeek; i++) {
            days.push(<div key={`empty-${i}`} className="h-24 bg-gray-50/50 border border-gray-100"></div>);
        }

        // Days of current month
        for (let day = 1; day <= daysInMonth; day++) {
            const { type, record } = getDayStatus(day);

            let statusColor = '';
            let StatusIcon = null;

            switch (type) {
                case 'present':
                    statusColor = 'bg-green-50 border-green-200';
                    StatusIcon = <CheckCircle className="w-5 h-5 text-green-600" />;
                    break;
                case 'missed-checkout':
                    statusColor = 'bg-red-50 border-red-200';
                    StatusIcon = <XCircle className="w-5 h-5 text-red-600" />;
                    break;
                case 'absent':
                    statusColor = 'bg-red-50/50 border-red-100';
                    StatusIcon = <span className="text-xs font-bold text-red-400">ABSENT</span>;
                    break;
                case 'ongoing':
                    statusColor = 'bg-yellow-50 border-yellow-200';
                    StatusIcon = <Clock className="w-5 h-5 text-yellow-600" />;
                    break;
                default: // future or none
                    statusColor = 'bg-white border-gray-100';
            }

            days.push(
                <div key={day} className={`h-24 p-2 border relative transition-colors ${statusColor} hover:shadow-sm`}>
                    <div className="flex justify-between items-start">
                        <span className={`text-sm font-medium ${type === 'absent' ? 'text-red-300' : 'text-gray-700'}`}>{day}</span>
                        {StatusIcon}
                    </div>

                    {record && (
                        <div className="mt-2 text-xs space-y-1">
                            <div className="text-gray-600">
                                In: {new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            {record.checkOut && (
                                <div className="text-gray-600">
                                    Out: {new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            )}
                            {type === 'missed-checkout' && (
                                <div className="text-red-600 font-medium">Missed Checkout</div>
                            )}
                        </div>
                    )}
                </div>
            );
        }

        return days;
    };

    return (
        <div className="p-6">
            <div className="flex items-center gap-2 text-sm font-medium mb-6">
                <Link href="/admin/attendance" className="text-gray-500 hover:text-[#05033e] transition-colors">
                    Attendance
                </Link>
                <span className="text-gray-300">|</span>
                <span className="text-[#05033e]">Calendar</span>
            </div>

            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Attendance Calendar</h1>
                <div className="flex items-center gap-4">
                    <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h2 className="text-xl font-semibold w-40 text-center">
                        {currentDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                    </h2>
                    <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full">
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Days Header */}
                <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="py-3 text-center text-sm font-medium text-gray-500 uppercase">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7">
                    {loading ? (
                        <div className="col-span-7 h-96 flex items-center justify-center">
                            <Clock className="w-8 h-8 animate-spin text-gray-300" />
                        </div>
                    ) : (
                        renderCalendarDays()
                    )}
                </div>
            </div>

            {/* Legend */}
            <div className="mt-6 flex gap-6 text-sm">
                <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Present (Completed)</span>
                </div>
                <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span>Missed Checkout / Absent</span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-600" />
                    <span>Currently Working</span>
                </div>
            </div>
        </div>
    );
}
