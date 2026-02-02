'use client';

import { useState, useEffect } from 'react';
import { Clock, Save, AlertCircle, CheckCircle } from 'lucide-react';

interface SettingsData {
    checkInStartHour: number;
    checkInEndHour: number;
    checkOutStartHour: number;
}

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<SettingsData>({
        checkInStartHour: 10,
        checkInEndHour: 11,
        checkOutStartHour: 19,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/settings');
            const data = await res.json();
            if (data.success) {
                setSettings(data.data);
            }
        } catch (err) {
            console.error('Error fetching settings:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setError('');
        setSuccess('');
        setSaving(true);

        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to save settings');
                return;
            }

            setSuccess('Settings saved successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('An error occurred while saving');
        } finally {
            setSaving(false);
        }
    };

    const formatHour = (hour: number) => {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return `${displayHour}:00 ${period}`;
    };

    const hours = Array.from({ length: 24 }, (_, i) => i);

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#05033e]"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-500 mt-1">Configure attendance time restrictions</p>
            </div>

            {/* Attendance Time Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#05033e] rounded-lg">
                            <Clock className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-gray-900">Attendance Time Settings</h2>
                            <p className="text-sm text-gray-500">Control when employees can check-in and check-out</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Error/Success Messages */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600">
                            <AlertCircle className="w-5 h-5" />
                            <span>{error}</span>
                        </div>
                    )}
                    {success && (
                        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600">
                            <CheckCircle className="w-5 h-5" />
                            <span>{success}</span>
                        </div>
                    )}

                    {/* Check-in Time Range */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Check-in Start Time
                            </label>
                            <select
                                value={settings.checkInStartHour}
                                onChange={(e) => setSettings({ ...settings, checkInStartHour: parseInt(e.target.value) })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#05033e] focus:border-transparent"
                            >
                                {hours.map((hour) => (
                                    <option key={hour} value={hour}>
                                        {formatHour(hour)}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">Employees can start checking in from this time</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Check-in End Time
                            </label>
                            <select
                                value={settings.checkInEndHour}
                                onChange={(e) => setSettings({ ...settings, checkInEndHour: parseInt(e.target.value) })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#05033e] focus:border-transparent"
                            >
                                {hours.map((hour) => (
                                    <option key={hour} value={hour}>
                                        {formatHour(hour)}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">Check-in window closes at this time</p>
                        </div>
                    </div>

                    {/* Check-out Time */}
                    <div className="md:w-1/2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Check-out Start Time
                        </label>
                        <select
                            value={settings.checkOutStartHour}
                            onChange={(e) => setSettings({ ...settings, checkOutStartHour: parseInt(e.target.value) })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#05033e] focus:border-transparent"
                        >
                            {hours.map((hour) => (
                                <option key={hour} value={hour}>
                                    {formatHour(hour)}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Employees can check out after this time</p>
                    </div>

                    {/* Current Settings Display */}
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                        <h3 className="font-medium text-blue-900 mb-2">Current Configuration</h3>
                        <div className="text-sm text-blue-700 space-y-1">
                            <p>• Check-in allowed: <strong>{formatHour(settings.checkInStartHour)} - {formatHour(settings.checkInEndHour)}</strong></p>
                            <p>• Check-out allowed: <strong>After {formatHour(settings.checkOutStartHour)}</strong></p>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end pt-4 border-t border-gray-100">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-3 bg-[#05033e] text-white rounded-lg font-medium hover:bg-[#0a0875] transition-colors disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save Settings
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
