'use client';

import { useEffect, useState } from 'react';
import { MapPin, Plus, Edit2, Trash2, Loader2, Check, X } from 'lucide-react';

interface Location {
    _id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    radius: number;
    isActive: boolean;
}

export default function AdminLocationsPage() {
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        latitude: '',
        longitude: '',
        radius: '100',
    });

    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/locations');
            const data = await res.json();
            if (data.success) {
                setLocations(data.data);
            }
        } catch (error) {
            console.error('Error fetching locations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const url = editingId
                ? `/api/admin/locations/${editingId}`
                : '/api/admin/locations';
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (data.success) {
                fetchLocations();
                resetForm();
            } else {
                alert(data.error);
            }
        } catch (error) {
            alert('Failed to save location');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (location: Location) => {
        setEditingId(location._id);
        setFormData({
            name: location.name,
            address: location.address,
            latitude: String(location.latitude),
            longitude: String(location.longitude),
            radius: String(location.radius),
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this location?')) return;

        try {
            const res = await fetch(`/api/admin/locations/${id}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (data.success) {
                fetchLocations();
            } else {
                alert(data.error);
            }
        } catch (error) {
            alert('Failed to delete location');
        }
    };

    const toggleActive = async (location: Location) => {
        try {
            const res = await fetch(`/api/admin/locations/${location._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !location.isActive }),
            });
            const data = await res.json();
            if (data.success) {
                fetchLocations();
            }
        } catch (error) {
            alert('Failed to update location');
        }
    };

    const resetForm = () => {
        setFormData({ name: '', address: '', latitude: '', longitude: '', radius: '100' });
        setEditingId(null);
        setShowForm(false);
    };

    const useCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData(prev => ({
                    ...prev,
                    latitude: position.coords.latitude.toFixed(6),
                    longitude: position.coords.longitude.toFixed(6),
                }));
            },
            (error) => {
                alert('Unable to get location: ' + error.message);
            }
        );
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Attendance Locations</h1>
                    <p className="text-gray-500 mt-1">Manage allowed locations for employee attendance</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowForm(true); }}
                    className="px-4 py-2 bg-[#05033e] text-white rounded-lg hover:bg-blue-900 transition-colors flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Add Location
                </button>
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">
                        {editingId ? 'Edit Location' : 'Add New Location'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Location Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#05033e] focus:border-transparent"
                                    placeholder="e.g., Main Office"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Allowed Radius (meters) *
                                </label>
                                <input
                                    type="number"
                                    value={formData.radius}
                                    onChange={(e) => setFormData({ ...formData, radius: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#05033e] focus:border-transparent"
                                    min="10"
                                    max="5000"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Address *
                            </label>
                            <input
                                type="text"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#05033e] focus:border-transparent"
                                placeholder="e.g., 123 Main Street, City, State"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Latitude *
                                </label>
                                <input
                                    type="text"
                                    value={formData.latitude}
                                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#05033e] focus:border-transparent"
                                    placeholder="e.g., 28.6139"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Longitude *
                                </label>
                                <input
                                    type="text"
                                    value={formData.longitude}
                                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#05033e] focus:border-transparent"
                                    placeholder="e.g., 77.2090"
                                    required
                                />
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={useCurrentLocation}
                            className="text-[#05033e] hover:underline text-sm flex items-center gap-1"
                        >
                            <MapPin className="w-4 h-4" />
                            Use my current location
                        </button>
                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-2 bg-[#05033e] text-white rounded-lg hover:bg-blue-900 disabled:opacity-50 flex items-center gap-2"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                {saving ? 'Saving...' : (editingId ? 'Update' : 'Save')}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                            >
                                <X className="w-4 h-4" />
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Locations List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-[#05033e]" />
                </div>
            ) : locations.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                    <MapPin className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No locations configured yet</p>
                    <p className="text-sm text-gray-400">Add your first attendance location to get started</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {locations.map((location) => (
                        <div
                            key={location._id}
                            className={`bg-white rounded-xl shadow-sm border p-6 ${location.isActive ? 'border-gray-100' : 'border-red-200 bg-red-50/50'
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-xl ${location.isActive ? 'bg-[#05033e]/10' : 'bg-red-100'
                                        }`}>
                                        <MapPin className={`w-6 h-6 ${location.isActive ? 'text-[#05033e]' : 'text-red-500'
                                            }`} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                            {location.name}
                                            {!location.isActive && (
                                                <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                                                    Inactive
                                                </span>
                                            )}
                                        </h3>
                                        <p className="text-gray-500 text-sm">{location.address}</p>
                                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                            <span>Lat: {location.latitude}</span>
                                            <span>Lng: {location.longitude}</span>
                                            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">
                                                {location.radius}m radius
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => toggleActive(location)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium ${location.isActive
                                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                                            }`}
                                    >
                                        {location.isActive ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button
                                        onClick={() => handleEdit(location)}
                                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(location._id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
