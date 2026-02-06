'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface AttendanceData {
    todayAttendance: {
        checkIn?: string;
        checkOut?: string;
        status: string;
    } | null;
}

interface LeaveData {
    summary: {
        pending: number;
        approved: number;
        totalApprovedDays: number;
    };
}

interface AnnouncementData {
    announcements: Array<{
        _id: string;
        title: string;
        content: string;
        priority: string;
        category: string;
        createdAt: string;
    }>;
    summary: {
        urgent: number;
        high: number;
    };
}

export default function EmployeeDashboard() {
    const { data: session } = useSession();
    const [attendance, setAttendance] = useState<AttendanceData | null>(null);
    const [leaves, setLeaves] = useState<LeaveData | null>(null);
    const [announcements, setAnnouncements] = useState<AnnouncementData | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [attendanceRes, leavesRes, announcementsRes] = await Promise.all([
                fetch('/api/attendance'),
                fetch('/api/employee/leave?limit=5'),
                fetch('/api/employee/announcements?limit=3'),
            ]);

            if (attendanceRes.ok) {
                const result = await attendanceRes.json();
                // Handle both old and new API response formats
                if (result.data) {
                    setAttendance(result.data);
                } else if (result.todayAttendance !== undefined) {
                    setAttendance(result);
                }
            }
            if (leavesRes.ok) {
                const data = await leavesRes.json();
                setLeaves(data);
            }
            if (announcementsRes.ok) {
                const data = await announcementsRes.json();
                setAnnouncements(data);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-GB', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return '#ef4444';
            case 'high': return '#f97316';
            case 'normal': return '#06b6d4';
            default: return '#6b7280';
        }
    };

    return (
        <div className="dashboard">
            <style jsx>{`
                .dashboard {
                    padding: 24px;
            max-width: 1400px;
            margin: 0 auto;
                }

            .welcome-section {
                margin - bottom: 32px;
                }

            .greeting {
                color: #64748b;
            font-size: 14px;
            margin-bottom: 4px;
                }

            .welcome-name {
                color: #05033e;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
                }

            .date-time {
                display: flex;
            align-items: center;
            gap: 16px;
            color: #64748b;
            font-size: 14px;
                }

            .current-time {
                color: #05033e;
            font-weight: 600;
            font-family: 'Courier New', monospace;
            font-size: 16px;
            background: #e2e8f0;
            padding: 2px 8px;
            border-radius: 4px;
                }

            .stats-grid {
                display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 20px;
            margin-bottom: 32px;
                }

            .stat-card {
                background: white;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            padding: 24px;
            transition: all 0.3s ease;
                }

            .stat-card:hover {
                transform: translateY(-4px);
            border-color: #bae6fd;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
                }

            .stat-header {
                display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 16px;
                }

            .stat-icon {
                width: 48px;
            height: 48px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
                }

            .stat-icon.attendance {
                background: #e0f2fe;
            color: #0284c7;
                }

            .stat-icon.leave {
                background: #ede9fe;
            color: #7c3aed;
                }

            .stat-icon.pending {
                background: #fef3c7;
            color: #d97706;
                }

            .stat-icon.announcements {
                background: #fee2e2;
            color: #dc2626;
                }

            .stat-title {
                color: #64748b;
            font-size: 13px;
            margin-bottom: 4px;
                }

            .stat-value {
                color: #0f172a;
            font-size: 24px;
            font-weight: 700;
                }

            .stat-subtitle {
                color: #94a3b8;
            font-size: 12px;
            margin-top: 4px;
                }

            .content-grid {
                display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 24px;
                }

            .content-card {
                background: white;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            overflow: hidden;
                }

            .card-header {
                padding: 20px 24px;
            border-bottom: 1px solid #f1f5f9;
            background: #f8fafc;
            display: flex;
            align-items: center;
            justify-content: space-between;
                }

            .card-title {
                color: #0f172a;
            font-size: 16px;
            font-weight: 600;
                }

            .card-link {
                color: #0284c7;
            font-size: 14px;
            font-weight: 600;
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 4px;
            transition: color 0.2s ease;
            background: #e0f2fe;
            padding: 6px 12px;
            border-radius: 6px;
                }

            .card-link:hover {
                color: white;
            background: #0284c7;
                }

            .card-content {
                padding: 20px 24px;
                }

            .attendance-status {
                display: flex;
            align-items: center;
            gap: 16px;
            padding: 16px;
            background: #f0f9ff;
            border-radius: 12px;
            margin-bottom: 16px;
            border: 1px solid #e0f2fe;
                }

            .status-indicator {
                width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #22c55e;
            box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.2);
                }

            .status-indicator.not-checked {
                background: #f59e0b;
            box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.2);
                }

            .status-text {
                color: #0f172a;
            font-size: 14px;
            font-weight: 500;
                }

            .attendance-times {
                display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
                }

            .time-item {
                padding: 12px;
            background: #f8fafc;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
                }

            .time-label {
                color: #64748b;
            font-size: 12px;
            margin-bottom: 4px;
                }

            .time-value {
                color: #0f172a;
            font-size: 16px;
            font-weight: 600;
                }

            .announcement-item {
                padding: 16px;
            border-bottom: 1px solid #f1f5f9;
            transition: background 0.2s ease;
                }

            .announcement-item:last-child {
                border - bottom: none;
                }

            .announcement-item:hover {
                background: #f8fafc;
                }

            .announcement-header {
                display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
                }

            .priority-badge {
                padding: 2px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
                }

            .announcement-title {
                color: #0f172a;
            font-size: 14px;
            font-weight: 600;
            flex: 1;
                }

            .announcement-content {
                color: #64748b;
            font-size: 13px;
            line-height: 1.5;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
                }

            .announcement-date {
                color: #94a3b8;
            font-size: 11px;
            margin-top: 8px;
                }

            .empty-state {
                text - align: center;
            padding: 32px;
            color: #64748b;
                }

            .quick-actions {
                display: flex;
            gap: 12px;
            margin-top: 20px;
                }

            .action-btn {
                flex: 1;
            padding: 12px;
            border-radius: 10px;
            text-align: center;
            text-decoration: none;
            font-size: 13px;
            font-weight: 500;
            transition: all 0.2s ease;
                }

            .action-btn.primary {
                background: linear-gradient(135deg, #05033e, #1a1a6e);
            color: white;
            font-weight: 600;
                }

            .action-btn.primary:hover {
                transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(5, 3, 62, 0.25);
                }

            .action-btn.secondary {
                background: white;
            border: 1px solid #e2e8f0;
            color: #0f172a;
            font-weight: 600;
                }

            .action-btn.secondary:hover {
                background: #f8fafc;
            border-color: #cbd5e1;
                }

            .loading-skeleton {
                background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 8px;
                }

            @keyframes shimmer {
                0 % { background- position: 200% 0; }
            100% {background - position: -200% 0; }
                }

            @media (max-width: 768px) {
                    .dashboard {
                padding: 16px;
                    }

            .welcome-name {
                font - size: 22px;
                    }

            .content-grid {
                grid - template - columns: 1fr;
                    }

            .stats-grid {
                grid - template - columns: repeat(2, 1fr);
                    }

            .quick-actions {
                flex - direction: column;
                    }
                }
            `}</style>

            {/* Welcome Section */}
            <div className="welcome-section">
                <p className="greeting">{getGreeting()}</p>
                <h1 className="welcome-name">
                    {session?.user?.name || session?.user?.email?.split('@')[0]}!
                </h1>
                <div className="date-time">
                    <span>{formatDate(currentTime)}</span>
                    <span className="current-time">{formatTime(currentTime)}</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-header">
                        <div>
                            <p className="stat-title">Today&apos;s Status</p>
                            <p className="stat-value">
                                {loading ? '...' : attendance?.todayAttendance?.checkIn ? 'Checked In' : 'Not Checked In'}
                            </p>
                            {attendance?.todayAttendance?.checkIn && (
                                <p className="stat-subtitle">
                                    at {new Date(attendance.todayAttendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            )}
                        </div>
                        <div className="stat-icon attendance">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <div>
                            <p className="stat-title">Leaves Taken</p>
                            <p className="stat-value">{loading ? '...' : leaves?.summary?.totalApprovedDays || 0} Days</p>
                            <p className="stat-subtitle">Approved leaves this year</p>
                        </div>
                        <div className="stat-icon leave">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <div>
                            <p className="stat-title">Pending Requests</p>
                            <p className="stat-value">{loading ? '...' : leaves?.summary?.pending || 0}</p>
                            <p className="stat-subtitle">Awaiting approval</p>
                        </div>
                        <div className="stat-icon pending">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <div>
                            <p className="stat-title">Important Alerts</p>
                            <p className="stat-value">
                                {loading ? '...' : (announcements?.summary?.urgent || 0) + (announcements?.summary?.high || 0)}
                            </p>
                            <p className="stat-subtitle">Urgent + High priority</p>
                        </div>
                        <div className="stat-icon announcements">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="content-grid">
                {/* Attendance Card */}
                <div className="content-card">
                    <div className="card-header">
                        <h3 className="card-title">Today&apos;s Attendance</h3>
                        <Link href="/employee/attendance" className="card-link">
                            Mark Attendance →
                        </Link>
                    </div>
                    <div className="card-content">
                        <div className="attendance-status">
                            <div className={`status-indicator ${attendance?.todayAttendance?.checkIn ? '' : 'not-checked'}`}></div>
                            <span className="status-text">
                                {attendance?.todayAttendance?.checkIn
                                    ? (attendance?.todayAttendance?.checkOut ? 'Day Completed' : 'Currently Working')
                                    : 'Not Checked In Yet'}
                            </span>
                        </div>

                        <div className="attendance-times">
                            <div className="time-item">
                                <p className="time-label">Check In</p>
                                <p className="time-value">
                                    {attendance?.todayAttendance?.checkIn
                                        ? new Date(attendance.todayAttendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                        : '--:--'}
                                </p>
                            </div>
                            <div className="time-item">
                                <p className="time-label">Check Out</p>
                                <p className="time-value">
                                    {attendance?.todayAttendance?.checkOut
                                        ? new Date(attendance.todayAttendance.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                        : '--:--'}
                                </p>
                            </div>
                        </div>

                        <div className="quick-actions">
                            <Link href="/employee/attendance" className="action-btn primary">
                                Go to Attendance
                            </Link>
                            <Link href="/employee/leave" className="action-btn secondary">
                                Request Leave
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Announcements Card */}
                <div className="content-card">
                    <div className="card-header">
                        <h3 className="card-title">Recent Announcements</h3>
                        <Link href="/employee/announcements" className="card-link">
                            View All →
                        </Link>
                    </div>
                    <div className="card-content" style={{ padding: 0 }}>
                        {loading ? (
                            <div style={{ padding: 24 }}>
                                <div className="loading-skeleton" style={{ height: 60, marginBottom: 12 }}></div>
                                <div className="loading-skeleton" style={{ height: 60, marginBottom: 12 }}></div>
                                <div className="loading-skeleton" style={{ height: 60 }}></div>
                            </div>
                        ) : announcements?.announcements?.length ? (
                            announcements.announcements.map((announcement) => (
                                <div key={announcement._id} className="announcement-item">
                                    <div className="announcement-header">
                                        <span
                                            className="priority-badge"
                                            style={{
                                                background: `${getPriorityColor(announcement.priority)}20`,
                                                color: getPriorityColor(announcement.priority)
                                            }}
                                        >
                                            {announcement.priority}
                                        </span>
                                        <span className="announcement-title">{announcement.title}</span>
                                    </div>
                                    <p className="announcement-content">{announcement.content}</p>
                                    <p className="announcement-date">
                                        {new Date(announcement.createdAt).toLocaleDateString('en-GB')}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">No announcements yet</div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
}
