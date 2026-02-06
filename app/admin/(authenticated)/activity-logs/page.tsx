'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Activity, Filter, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

interface ActivityLogEntry {
    _id: string;
    userId: string;
    userEmail: string;
    userRole: 'admin' | 'sub_admin';
    action: string;
    entityType: string;
    entityId?: string;
    entityName?: string;
    description: string;
    metadata?: Record<string, any>;
    createdAt: string;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

const ACTION_COLORS: Record<string, string> = {
    created: 'bg-green-100 text-green-800',
    updated: 'bg-blue-100 text-blue-800',
    deleted: 'bg-red-100 text-red-800',
    activated: 'bg-emerald-100 text-emerald-800',
    deactivated: 'bg-orange-100 text-orange-800',
    promoted: 'bg-purple-100 text-purple-800',
};

const ENTITY_COLORS: Record<string, string> = {
    job: 'bg-indigo-100 text-indigo-800',
    user: 'bg-cyan-100 text-cyan-800',
    employee: 'bg-teal-100 text-teal-800',
    attendance: 'bg-amber-100 text-amber-800',
    settings: 'bg-gray-100 text-gray-800',
};

export default function ActivityLogsPage() {
    const { data: session } = useSession();
    const currentUserRole = (session?.user as any)?.role;
    const isSuperAdmin = currentUserRole === 'admin';

    const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        limit: 50,
        total: 0,
        totalPages: 0,
    });

    // Filters
    const [actionFilter, setActionFilter] = useState('');
    const [entityTypeFilter, setEntityTypeFilter] = useState('');
    const [userRoleFilter, setUserRoleFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        if (isSuperAdmin) {
            fetchLogs();
        }
    }, [isSuperAdmin, pagination.page, actionFilter, entityTypeFilter, userRoleFilter]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            params.append('page', pagination.page.toString());
            params.append('limit', pagination.limit.toString());
            if (actionFilter) params.append('action', actionFilter);
            if (entityTypeFilter) params.append('entityType', entityTypeFilter);
            if (userRoleFilter) params.append('userRole', userRoleFilter);

            const res = await fetch(`/api/admin/activity-logs?${params.toString()}`);
            const data = await res.json();

            if (data.success) {
                setLogs(data.data);
                setPagination(data.pagination);
            } else {
                setError(data.error || 'Failed to load activity logs');
            }
        } catch (err) {
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Access denied for non-super admins
    if (!isSuperAdmin) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
                <p className="text-gray-600">Only Super Admins can view activity logs.</p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Activity Logs</h1>
                    <p className="text-gray-500 mt-1">Track all administrative actions (90-day retention)</p>
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                    <Filter className="w-4 h-4" />
                    Filters
                </button>
            </div>

            {/* Filters */}
            {showFilters && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <select
                            value={actionFilter}
                            onChange={(e) => { setActionFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#05033e] focus:border-transparent"
                        >
                            <option value="">All Actions</option>
                            <option value="created">Created</option>
                            <option value="updated">Updated</option>
                            <option value="deleted">Deleted</option>
                            <option value="activated">Activated</option>
                            <option value="deactivated">Deactivated</option>
                            <option value="promoted">Promoted</option>
                        </select>
                        <select
                            value={entityTypeFilter}
                            onChange={(e) => { setEntityTypeFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#05033e] focus:border-transparent"
                        >
                            <option value="">All Entity Types</option>
                            <option value="job">Job</option>
                            <option value="user">User</option>
                            <option value="employee">Employee</option>
                            <option value="attendance">Attendance</option>
                            <option value="settings">Settings</option>
                        </select>
                        <select
                            value={userRoleFilter}
                            onChange={(e) => { setUserRoleFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#05033e] focus:border-transparent"
                        >
                            <option value="">All Roles</option>
                            <option value="admin">Super Admin</option>
                            <option value="sub_admin">Sub Admin</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Logs List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#05033e]"></div>
                </div>
            ) : error ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                    {error}
                    <button onClick={fetchLogs} className="ml-4 underline hover:no-underline">Try again</button>
                </div>
            ) : logs.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                    <Activity className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No activity logs found</p>
                </div>
            ) : (
                <>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="divide-y divide-gray-100">
                            {logs.map((log) => (
                                <div key={log._id} className="p-4 hover:bg-gray-50">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <div className="flex-1">
                                            <p className="text-gray-900 font-medium">{log.description}</p>
                                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-800'}`}>
                                                    {log.action}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ENTITY_COLORS[log.entityType] || 'bg-gray-100 text-gray-800'}`}>
                                                    {log.entityType}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    by {log.userEmail}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${log.userRole === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'}`}>
                                                    {log.userRole === 'admin' ? 'Super Admin' : 'Sub Admin'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-500 whitespace-nowrap">
                                            {formatDate(log.createdAt)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                            <span className="text-sm text-gray-600">
                                Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                                    disabled={pagination.page <= 1}
                                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="px-4 py-2 text-sm font-medium">
                                    Page {pagination.page} of {pagination.totalPages}
                                </span>
                                <button
                                    onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                                    disabled={pagination.page >= pagination.totalPages}
                                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
