'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useCallback } from 'react';

interface AttendanceRecord {
    _id: string;
    date: string;
    checkIn?: string;
    checkOut?: string;
    status: string;
    workHours?: number;
    checkInLocation?: { name: string };
    checkOutLocation?: { name: string };
}

interface Location {
    _id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    radius: number;
}

export default function EmployeeAttendancePage() {
    const { data: session } = useSession();
    const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
    const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
    const [allowedLocations, setAllowedLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);
    const [marking, setMarking] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locationLoading, setLocationLoading] = useState(false);

    const fetchAttendanceData = useCallback(async () => {
        try {
            const res = await fetch('/api/attendance');
            if (res.ok) {
                const result = await res.json();
                // Handle both old and new API response formats
                const data = result.data || result;
                setTodayAttendance(data.todayAttendance || null);
                setAttendanceHistory(data.attendance || data.history || []);
                setAllowedLocations(data.locations || data.allowedLocations || []);
            }
        } catch (err) {
            console.error('Error fetching attendance:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAttendanceData();
    }, [fetchAttendanceData]);

    const getCurrentLocation = (): Promise<GeolocationPosition> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by your browser'));
                return;
            }
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            });
        });
    };

    const handleMarkAttendance = async () => {
        setError('');
        setSuccess('');
        setMarking(true);
        setLocationLoading(true);

        try {
            const position = await getCurrentLocation();
            const { latitude, longitude } = position.coords;
            setCurrentLocation({ lat: latitude, lng: longitude });
            setLocationLoading(false);

            const action = todayAttendance?.checkIn ? 'check-out' : 'check-in';

            const res = await fetch('/api/attendance/mark', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ latitude, longitude, action }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to mark attendance');
                return;
            }

            setSuccess(data.message || 'Attendance marked successfully!');
            fetchAttendanceData();
        } catch (err: any) {
            setLocationLoading(false);
            if (err.code === 1) {
                setError('Location access denied. Please enable location permissions.');
            } else if (err.code === 2) {
                setError('Unable to determine your location. Please try again.');
            } else if (err.code === 3) {
                setError('Location request timed out. Please try again.');
            } else {
                setError(err.message || 'An error occurred');
            }
        } finally {
            setMarking(false);
        }
    };

    const formatTime = (dateString?: string) => {
        if (!dateString) return '--:--';
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'present': return '#22c55e';
            case 'half-day': return '#f59e0b';
            case 'absent': return '#ef4444';
            default: return '#6b7280';
        }
    };

    return (
        <div className="attendance-page">
            <style jsx>{`
                .attendance-page {
                    padding: 24px;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                
                .page-header {
                    margin-bottom: 32px;
                }
                
                .page-title {
                    color: white;
                    font-size: 28px;
                    font-weight: 700;
                    margin-bottom: 8px;
                }
                
                .page-subtitle {
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 14px;
                }
                
                .main-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 24px;
                }
                
                .card {
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 16px;
                    overflow: hidden;
                }
                
                .card-header {
                    padding: 20px 24px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }
                
                .card-title {
                    color: white;
                    font-size: 16px;
                    font-weight: 600;
                }
                
                .card-content {
                    padding: 24px;
                }
                
                .status-display {
                    text-align: center;
                    padding: 24px;
                    background: linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(6, 182, 212, 0.05));
                    border-radius: 12px;
                    margin-bottom: 24px;
                }
                
                .status-icon {
                    width: 64px;
                    height: 64px;
                    border-radius: 50%;
                    background: rgba(6, 182, 212, 0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 16px;
                    color: #06b6d4;
                }
                
                .status-icon.checked-in {
                    background: rgba(34, 197, 94, 0.2);
                    color: #22c55e;
                }
                
                .status-icon.completed {
                    background: rgba(139, 92, 246, 0.2);
                    color: #8b5cf6;
                }
                
                .status-text {
                    color: white;
                    font-size: 18px;
                    font-weight: 600;
                    margin-bottom: 4px;
                }
                
                .status-subtext {
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 13px;
                }
                
                .time-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                    margin-bottom: 24px;
                }
                
                .time-card {
                    padding: 16px;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 10px;
                    text-align: center;
                }
                
                .time-label {
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 12px;
                    margin-bottom: 4px;
                }
                
                .time-value {
                    color: white;
                    font-size: 20px;
                    font-weight: 600;
                }
                
                .mark-button {
                    width: 100%;
                    padding: 16px;
                    border: none;
                    border-radius: 12px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }
                
                .mark-button.check-in {
                    background: linear-gradient(135deg, #06b6d4, #0891b2);
                    color: white;
                }
                
                .mark-button.check-out {
                    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
                    color: white;
                }
                
                .mark-button:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 30px rgba(6, 182, 212, 0.3);
                }
                
                .mark-button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    background: rgba(255, 255, 255, 0.1);
                    color: rgba(255, 255, 255, 0.5);
                }
                
                .alert {
                    padding: 12px 16px;
                    border-radius: 10px;
                    margin-bottom: 16px;
                    font-size: 14px;
                }
                
                .alert.error {
                    background: rgba(239, 68, 68, 0.15);
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    color: #fca5a5;
                }
                
                .alert.success {
                    background: rgba(34, 197, 94, 0.15);
                    border: 1px solid rgba(34, 197, 94, 0.3);
                    color: #86efac;
                }
                
                .location-list {
                    margin-top: 16px;
                }
                
                .location-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 8px;
                    margin-bottom: 8px;
                }
                
                .location-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    background: rgba(6, 182, 212, 0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #06b6d4;
                }
                
                .location-details {
                    flex: 1;
                }
                
                .location-name {
                    color: white;
                    font-size: 14px;
                    font-weight: 500;
                }
                
                .location-address {
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 12px;
                }
                
                .history-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                
                .history-table th {
                    text-align: left;
                    padding: 12px;
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 12px;
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }
                
                .history-table td {
                    padding: 14px 12px;
                    color: white;
                    font-size: 14px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }
                
                .status-badge {
                    padding: 4px 10px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 500;
                    text-transform: capitalize;
                }
                
                .spinner {
                    width: 20px;
                    height: 20px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
                
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                
                .full-width {
                    grid-column: 1 / -1;
                }
                
                @media (max-width: 768px) {
                    .attendance-page {
                        padding: 16px;
                    }
                    
                    .main-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .page-title {
                        font-size: 22px;
                    }
                    
                    .history-table {
                        font-size: 12px;
                    }
                    
                    .history-table th,
                    .history-table td {
                        padding: 10px 8px;
                    }
                }
            `}</style>

            <div className="page-header">
                <h1 className="page-title">Attendance</h1>
                <p className="page-subtitle">Mark your daily attendance with geolocation verification</p>
            </div>

            <div className="main-grid">
                {/* Today's Attendance Card */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Today&apos;s Attendance</h2>
                    </div>
                    <div className="card-content">
                        <div className="status-display">
                            <div className={`status-icon ${todayAttendance?.checkOut ? 'completed' : todayAttendance?.checkIn ? 'checked-in' : ''}`}>
                                {todayAttendance?.checkOut ? (
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                ) : todayAttendance?.checkIn ? (
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <polyline points="12 6 12 12 16 14" />
                                    </svg>
                                ) : (
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="12" y1="8" x2="12" y2="12" />
                                        <line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                )}
                            </div>
                            <p className="status-text">
                                {todayAttendance?.checkOut
                                    ? 'Day Completed'
                                    : todayAttendance?.checkIn
                                        ? 'Currently Working'
                                        : 'Not Checked In'}
                            </p>
                            <p className="status-subtext">
                                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </p>
                        </div>

                        <div className="time-grid">
                            <div className="time-card">
                                <p className="time-label">Check In</p>
                                <p className="time-value">{formatTime(todayAttendance?.checkIn)}</p>
                            </div>
                            <div className="time-card">
                                <p className="time-label">Check Out</p>
                                <p className="time-value">{formatTime(todayAttendance?.checkOut)}</p>
                            </div>
                        </div>

                        {error && <div className="alert error">{error}</div>}
                        {success && <div className="alert success">{success}</div>}

                        <button
                            onClick={handleMarkAttendance}
                            disabled={marking || !!todayAttendance?.checkOut}
                            className={`mark-button ${todayAttendance?.checkIn ? 'check-out' : 'check-in'}`}
                        >
                            {marking ? (
                                <>
                                    <div className="spinner"></div>
                                    {locationLoading ? 'Getting Location...' : 'Marking...'}
                                </>
                            ) : todayAttendance?.checkOut ? (
                                'Attendance Completed'
                            ) : todayAttendance?.checkIn ? (
                                <>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                        <polyline points="16 17 21 12 16 7" />
                                        <line x1="21" y1="12" x2="9" y2="12" />
                                    </svg>
                                    Check Out
                                </>
                            ) : (
                                <>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                                        <polyline points="10 17 15 12 10 7" />
                                        <line x1="15" y1="12" x2="3" y2="12" />
                                    </svg>
                                    Check In
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Allowed Locations Card */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Allowed Locations</h2>
                    </div>
                    <div className="card-content">
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 16 }}>
                            You can mark attendance only when within the radius of these locations.
                        </p>
                        <div className="location-list">
                            {allowedLocations.length ? (
                                allowedLocations.map((loc) => (
                                    <div key={loc._id} className="location-item">
                                        <div className="location-icon">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                                <circle cx="12" cy="10" r="3" />
                                            </svg>
                                        </div>
                                        <div className="location-details">
                                            <p className="location-name">{loc.name}</p>
                                            <p className="location-address">{loc.address} ({loc.radius}m radius)</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: 24 }}>
                                    No locations configured
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Attendance History */}
                <div className="card full-width">
                    <div className="card-header">
                        <h2 className="card-title">Attendance History</h2>
                    </div>
                    <div className="card-content" style={{ padding: 0, overflowX: 'auto' }}>
                        <table className="history-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Check In</th>
                                    <th>Check Out</th>
                                    <th>Work Hours</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'center', padding: 32, color: 'rgba(255,255,255,0.4)' }}>
                                            Loading...
                                        </td>
                                    </tr>
                                ) : attendanceHistory.length ? (
                                    attendanceHistory.map((record) => (
                                        <tr key={record._id}>
                                            <td>{formatDate(record.date)}</td>
                                            <td>{formatTime(record.checkIn)}</td>
                                            <td>{formatTime(record.checkOut)}</td>
                                            <td>{record.workHours ? `${record.workHours.toFixed(1)}h` : '--'}</td>
                                            <td>
                                                <span
                                                    className="status-badge"
                                                    style={{
                                                        background: `${getStatusColor(record.status)}20`,
                                                        color: getStatusColor(record.status)
                                                    }}
                                                >
                                                    {record.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'center', padding: 32, color: 'rgba(255,255,255,0.4)' }}>
                                            No attendance records yet
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
