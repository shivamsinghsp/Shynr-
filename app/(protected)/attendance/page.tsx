"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { MapPin, Clock, CheckCircle, XCircle, Loader2, Calendar, LogIn, LogOut, AlertCircle } from "lucide-react";

interface AttendanceRecord {
    _id: string;
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

interface Location {
    _id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    radius: number;
}

export default function AttendancePage() {
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(true);
    const [marking, setMarking] = useState(false);
    const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
    const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [gettingLocation, setGettingLocation] = useState(false);

    const userRole = (session?.user as any)?.role;
    const isEmployee = userRole === 'employee' || userRole === 'admin';

    useEffect(() => {
        if (status === 'authenticated' && isEmployee) {
            fetchAttendance();
        } else if (status === 'authenticated') {
            setLoading(false);
        }
    }, [status, isEmployee]);

    const fetchAttendance = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/attendance');
            const data = await res.json();
            if (data.success) {
                setTodayAttendance(data.data.todayAttendance);
                setAttendanceHistory(data.data.attendance);
                setLocations(data.data.locations);
            }
        } catch (error) {
            console.error('Error fetching attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    const getCurrentLocation = () => {
        return new Promise<{ lat: number; lng: number }>((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by your browser'));
                return;
            }

            setGettingLocation(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setGettingLocation(false);
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    setGettingLocation(false);
                    let errorMessage = 'Unable to get your location';
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Location information is unavailable.';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Location request timed out.';
                            break;
                    }
                    reject(new Error(errorMessage));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });
    };

    const handleMarkAttendance = async (action: 'check-in' | 'check-out') => {
        try {
            setMarking(true);
            setMessage(null);
            setLocationError(null);

            // Get current location
            const location = await getCurrentLocation();
            setUserLocation(location);

            const res = await fetch('/api/attendance/mark', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    latitude: location.lat,
                    longitude: location.lng,
                    action,
                }),
            });

            const data = await res.json();

            if (data.success) {
                setMessage({ type: 'success', text: data.message });
                fetchAttendance(); // Refresh data
            } else {
                if (data.nearestLocation) {
                    const dist = data.nearestLocation.distance;
                    const required = data.nearestLocation.requiredRadius;
                    const diff = dist - required;
                    setMessage({
                        type: 'error',
                        text: `You are ${dist}m away from ${data.nearestLocation.name}. You need to be within ${required}m.`
                    });
                    setLocationError(`You're ${diff}m too far. Move ${diff}m closer or ask admin to increase the radius.`);
                } else {
                    setMessage({ type: 'error', text: data.error || 'Failed to mark attendance' });
                }
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to mark attendance' });
        } finally {
            setMarking(false);
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

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#05033e]" />
            </div>
        );
    }

    if (!isEmployee) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
                    <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <XCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
                    <p className="text-gray-600 mb-4">
                        Attendance marking is only available for employees. Your current role is <strong className="text-gray-800">{userRole || 'User'}</strong>.
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                        If you are an employee, please contact your administrator to update your account permissions.
                    </p>
                    <a
                        href="/jobs"
                        className="inline-block px-6 py-3 bg-[#05033e] text-white rounded-xl font-medium hover:bg-blue-900 transition-colors"
                    >
                        ← Back to Jobs
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Attendance</h1>
                    <p className="text-gray-600">Mark your check-in and check-out</p>
                </div>

                {/* Message Alert */}
                {message && (
                    <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${message.type === 'success'
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                        }`}>
                        {message.type === 'success' ? (
                            <CheckCircle className="w-5 h-5" />
                        ) : (
                            <AlertCircle className="w-5 h-5" />
                        )}
                        <div>
                            <p className="font-medium">{message.text}</p>
                            {locationError && (
                                <p className="text-sm mt-1 opacity-80">{locationError}</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Today's Status Card */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
                    <div className="bg-gradient-to-r from-[#05033e] to-[#1a1a6e] p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white/70 text-sm">Today</p>
                                <p className="text-xl font-bold">{new Date().toLocaleDateString('en-GB', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                            </div>
                            <div className={`px-4 py-2 rounded-full text-sm font-semibold ${todayAttendance?.status === 'checked-out'
                                ? 'bg-green-500/20 text-green-200'
                                : todayAttendance?.status === 'checked-in'
                                    ? 'bg-yellow-500/20 text-yellow-200'
                                    : 'bg-gray-500/20 text-gray-300'
                                }`}>
                                {todayAttendance?.status === 'checked-out'
                                    ? '✓ Completed'
                                    : todayAttendance?.status === 'checked-in'
                                        ? '● Working'
                                        : '○ Not checked in'}
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        {todayAttendance ? (
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                                        <LogIn className="w-4 h-4" />
                                        <span className="text-sm">Check In</span>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {formatTime(todayAttendance.checkIn)}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {todayAttendance.checkInLocation.locationName}
                                    </p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                                        <LogOut className="w-4 h-4" />
                                        <span className="text-sm">Check Out</span>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {todayAttendance.checkOut ? formatTime(todayAttendance.checkOut) : '--:--'}
                                    </p>
                                    {todayAttendance.workHours && (
                                        <p className="text-xs text-green-600 mt-1">
                                            {todayAttendance.workHours.toFixed(1)} hours worked
                                        </p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 mb-6">You haven't checked in today</p>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                            {(!todayAttendance || todayAttendance.status === 'checked-out') && !todayAttendance && (
                                <button
                                    onClick={() => handleMarkAttendance('check-in')}
                                    disabled={marking || gettingLocation}
                                    className="flex-1 bg-gradient-to-r from-[#05033e] to-[#1a1a6e] text-white py-4 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {marking || gettingLocation ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <LogIn className="w-5 h-5" />
                                    )}
                                    {gettingLocation ? 'Getting Location...' : marking ? 'Marking...' : 'Check In'}
                                </button>
                            )}
                            {todayAttendance?.status === 'checked-in' && (
                                <button
                                    onClick={() => handleMarkAttendance('check-out')}
                                    disabled={marking || gettingLocation}
                                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {marking || gettingLocation ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <LogOut className="w-5 h-5" />
                                    )}
                                    {gettingLocation ? 'Getting Location...' : marking ? 'Marking...' : 'Check Out'}
                                </button>
                            )}
                            {todayAttendance?.status === 'checked-out' && (
                                <div className="flex-1 bg-green-50 text-green-700 py-4 rounded-xl font-semibold flex items-center justify-center gap-2">
                                    <CheckCircle className="w-5 h-5" />
                                    Attendance Complete for Today
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Allowed Locations */}
                {locations.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-[#05033e]" />
                            Allowed Locations
                        </h2>
                        {userLocation && (
                            <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm">
                                <p className="font-medium text-blue-900">Your Current Location:</p>
                                <p className="text-blue-700">Lat: {userLocation.lat.toFixed(6)}, Lng: {userLocation.lng.toFixed(6)}</p>
                            </div>
                        )}
                        <div className="grid gap-3">
                            {locations.map((loc) => (
                                <div key={loc._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900">{loc.name}</p>
                                        <p className="text-sm text-gray-500">{loc.address}</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Coords: {loc.latitude}, {loc.longitude}
                                        </p>
                                    </div>
                                    <span className="text-sm text-[#05033e] font-medium bg-[#05033e]/10 px-3 py-1 rounded-full">
                                        {loc.radius}m radius
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Attendance History */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-[#05033e]" />
                        Recent Attendance
                    </h2>
                    {attendanceHistory.length > 0 ? (
                        <div className="space-y-3">
                            {attendanceHistory.map((record) => (
                                <div key={record._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                    <div>
                                        <p className="font-medium text-gray-900">{formatDate(record.date)}</p>
                                        <p className="text-sm text-gray-500">
                                            {formatTime(record.checkIn)} - {record.checkOut ? formatTime(record.checkOut) : 'Ongoing'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${record.status === 'checked-out'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {record.status === 'checked-out' ? 'Complete' : 'In Progress'}
                                        </span>
                                        {record.workHours && (
                                            <p className="text-sm text-gray-600 mt-1">
                                                {record.workHours.toFixed(1)}h
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 py-8">No attendance records yet</p>
                    )}
                </div>
            </div>
        </div>
    );
}
