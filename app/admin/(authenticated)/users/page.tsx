'use client';

import { useEffect, useState } from 'react';

interface User {
    _id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    phone?: string;
    profileImage?: string;
    isActive?: boolean;
    emailVerified?: boolean;
    onboardingCompleted?: boolean;
    profileCompleteness?: number;
    createdAt: string;
    lastLoginAt?: string;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
    }, [statusFilter]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (statusFilter) params.append('status', statusFilter);
            if (search) params.append('search', search);

            const res = await fetch(`/api/admin/users?${params.toString()}`);
            const data = await res.json();

            if (data.success) {
                setUsers(data.data);
            } else {
                setError(data.error || 'Failed to load users');
            }
        } catch (err) {
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchUsers();
    };

    const handleToggleActive = async (userId: string, currentStatus: boolean) => {
        setUpdatingId(userId);
        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !currentStatus })
            });

            const data = await res.json();
            if (data.success) {
                setUsers(users.map(user =>
                    user._id === userId ? { ...user, isActive: !currentStatus } : user
                ));
            } else {
                alert(data.error || 'Failed to update user status');
            }
        } catch (err) {
            alert('Failed to update user status');
        } finally {
            setUpdatingId(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Users Management</h1>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <form onSubmit={handleSearch} className="flex-1">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#05033e] focus:border-transparent"
                            />
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </form>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#05033e] focus:border-transparent"
                    >
                        <option value="">All Users</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>

            {/* Users List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#05033e]"></div>
                </div>
            ) : error ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                    {error}
                    <button onClick={fetchUsers} className="ml-4 underline hover:no-underline">Try again</button>
                </div>
            ) : users.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <p className="text-gray-500">No users found</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Desktop Table */}
                    <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profile</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-[#05033e] rounded-full flex items-center justify-center text-white font-medium overflow-hidden">
                                                    {user.profileImage ? (
                                                        <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <>{user.firstName?.[0] || 'U'}{user.lastName?.[0] || ''}</>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {user.firstName || 'Unknown'} {user.lastName || ''}
                                                    </p>
                                                    <p className="text-sm text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-600">
                                            {user.phone || 'N/A'}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-[#05033e] rounded-full"
                                                        style={{ width: `${user.profileCompleteness ?? 0}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-gray-500">{user.profileCompleteness ?? 0}%</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${user.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {user.isActive !== false ? 'Active' : 'Inactive'}
                                                </span>
                                                {user.emailVerified && (
                                                    <span className="inline-flex items-center text-xs text-blue-600">
                                                        ✓ Verified
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-500">
                                            {formatDate(user.createdAt)}
                                        </td>
                                        <td className="px-4 py-4">
                                            <button
                                                onClick={() => handleToggleActive(user._id, user.isActive !== false)}
                                                disabled={updatingId === user._id}
                                                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${user.isActive !== false
                                                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                                                    }`}
                                            >
                                                {updatingId === user._id ? (
                                                    <span className="flex items-center gap-1">
                                                        <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                    </span>
                                                ) : (
                                                    user.isActive !== false ? 'Deactivate' : 'Activate'
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="lg:hidden divide-y divide-gray-100">
                        {users.map((user) => (
                            <div key={user._id} className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-[#05033e] rounded-full flex items-center justify-center text-white font-medium overflow-hidden">
                                            {user.profileImage ? (
                                                <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <>{user.firstName?.[0] || 'U'}{user.lastName?.[0] || ''}</>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {user.firstName || 'Unknown'} {user.lastName || ''}
                                            </p>
                                            <p className="text-sm text-gray-500">{user.email}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {user.isActive !== false ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="text-sm text-gray-500">
                                        Joined {formatDate(user.createdAt)}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-[#05033e] rounded-full"
                                                style={{ width: `${user.profileCompleteness ?? 0}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-gray-500">{user.profileCompleteness ?? 0}%</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleToggleActive(user._id, user.isActive !== false)}
                                    disabled={updatingId === user._id}
                                    className={`w-full py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${user.isActive !== false
                                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                                        }`}
                                >
                                    {updatingId === user._id ? (
                                        <span className="flex items-center justify-center gap-1">
                                            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                            Updating...
                                        </span>
                                    ) : (
                                        user.isActive !== false ? 'Deactivate User' : 'Activate User'
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
