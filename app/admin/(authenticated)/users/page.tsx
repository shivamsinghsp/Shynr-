'use client';

import { useEffect, useState } from 'react';
import { User as UserIcon, Shield, Briefcase, Users as UsersIcon } from 'lucide-react';

interface User {
    _id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    phone?: string;
    profileImage?: string;
    role?: 'user' | 'admin' | 'employee';
    isActive?: boolean;
    emailVerified?: boolean;
    onboardingCompleted?: boolean;
    profileCompleteness?: number;
    createdAt: string;
    lastLoginAt?: string;
}

const ROLE_OPTIONS = [
    { value: 'user', label: 'User', color: 'bg-gray-100 text-gray-800', icon: UserIcon, description: 'Regular job seeker' },
    { value: 'employee', label: 'Employee', color: 'bg-blue-100 text-blue-800', icon: Briefcase, description: 'Can mark attendance' },
    { value: 'admin', label: 'Admin', color: 'bg-purple-100 text-purple-800', icon: Shield, description: 'Full access' },
];

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [notification, setNotification] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
    }, [statusFilter, roleFilter]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (statusFilter) params.append('status', statusFilter);
            if (roleFilter) params.append('role', roleFilter);
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
                showNotification(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
            } else {
                alert(data.error || 'Failed to update user status');
            }
        } catch (err) {
            alert('Failed to update user status');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        setUpdatingId(userId);
        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole })
            });

            const data = await res.json();
            if (data.success) {
                setUsers(users.map(user =>
                    user._id === userId ? { ...user, role: newRole as User['role'] } : user
                ));
                const roleLabel = ROLE_OPTIONS.find(r => r.value === newRole)?.label || newRole;
                showNotification(`User role changed to ${roleLabel}`);
            } else {
                alert(data.error || 'Failed to update user role');
            }
        } catch (err) {
            alert('Failed to update user role');
        } finally {
            setUpdatingId(null);
        }
    };

    const showNotification = (message: string) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getRoleBadge = (role?: string) => {
        const roleOption = ROLE_OPTIONS.find(r => r.value === role) || ROLE_OPTIONS[0];
        return roleOption;
    };

    // Stats
    const totalUsers = users.length;
    const employeeCount = users.filter(u => u.role === 'employee').length;
    const adminCount = users.filter(u => u.role === 'admin').length;

    return (
        <div>
            {/* Notification Toast */}
            {notification && (
                <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-in slide-in-from-right">
                    {notification}
                </div>
            )}

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Users Management</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gray-100 rounded-xl">
                            <UsersIcon className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Users</p>
                            <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-xl">
                            <Briefcase className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Employees</p>
                            <p className="text-2xl font-bold text-gray-900">{employeeCount}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-100 rounded-xl">
                            <Shield className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Admins</p>
                            <p className="text-2xl font-bold text-gray-900">{adminCount}</p>
                        </div>
                    </div>
                </div>
            </div>

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
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#05033e] focus:border-transparent"
                    >
                        <option value="">All Roles</option>
                        <option value="user">Users</option>
                        <option value="employee">Employees</option>
                        <option value="admin">Admins</option>
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#05033e] focus:border-transparent"
                    >
                        <option value="">All Status</option>
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
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.map((user) => {
                                    const roleBadge = getRoleBadge(user.role);
                                    return (
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
                                                <select
                                                    value={user.role || 'user'}
                                                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                                    disabled={updatingId === user._id}
                                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border-0 cursor-pointer disabled:opacity-50 ${roleBadge.color}`}
                                                >
                                                    {ROLE_OPTIONS.map(opt => (
                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${user.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {user.isActive !== false ? 'Active' : 'Inactive'}
                                                    </span>
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
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="lg:hidden divide-y divide-gray-100">
                        {users.map((user) => {
                            const roleBadge = getRoleBadge(user.role);
                            return (
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
                                    </div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-sm text-gray-600">Role:</span>
                                        <select
                                            value={user.role || 'user'}
                                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                            disabled={updatingId === user._id}
                                            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border-0 ${roleBadge.color}`}
                                        >
                                            {ROLE_OPTIONS.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
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
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Role Legend */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="font-semibold text-blue-900 mb-3">Role Permissions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {ROLE_OPTIONS.map(role => (
                        <div key={role.value} className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${role.color}`}>
                                {role.label}
                            </span>
                            <span className="text-sm text-blue-800">{role.description}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
