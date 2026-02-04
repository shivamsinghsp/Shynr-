'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Stats {
    totalJobs: number;
    activeJobs: number;
    totalApplications: number;
    pendingApplications: number;
    totalUsers: number;
    applicationChange: number;
    usersThisMonth: number;
    jobsClosingSoon: number;
    recentApplications: Array<{
        _id: string;
        job: { title: string; company: string } | null;
        user: { firstName: string; lastName: string; email: string } | null;
        status: string;
        appliedAt: string;
    }>;
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/admin/stats');
            const data = await res.json();

            if (data.success) {
                setStats(data.data);
            } else {
                setError(data.error || 'Failed to load statistics');
            }
        } catch (err) {
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800',
            reviewed: 'bg-blue-100 text-blue-800',
            shortlisted: 'bg-green-100 text-green-800',
            interview: 'bg-purple-100 text-purple-800',
            offered: 'bg-emerald-100 text-emerald-800',
            rejected: 'bg-red-100 text-red-800',
            withdrawn: 'bg-gray-100 text-gray-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#05033e]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                {error}
                <button
                    onClick={() => { setLoading(true); setError(''); fetchStats(); }}
                    className="ml-4 underline hover:no-underline"
                >
                    Try again
                </button>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Dashboard Overview</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">Total Applications</h3>
                    <p className="text-2xl sm:text-3xl font-bold text-[#05033e] mt-2">
                        {stats?.totalApplications || 0}
                    </p>
                    <span className={`text-sm font-medium mt-1 inline-block ${(stats?.applicationChange || 0) >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                        {(stats?.applicationChange || 0) >= 0 ? '+' : ''}{stats?.applicationChange || 0}% from last week
                    </span>
                </div>

                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">Active Jobs</h3>
                    <p className="text-2xl sm:text-3xl font-bold text-[#05033e] mt-2">
                        {stats?.activeJobs || 0}
                    </p>
                    <span className="text-gray-400 text-sm font-medium mt-1 inline-block">
                        {stats?.jobsClosingSoon || 0} closing soon
                    </span>
                </div>

                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
                    <p className="text-2xl sm:text-3xl font-bold text-[#05033e] mt-2">
                        {stats?.totalUsers || 0}
                    </p>
                    <span className="text-green-500 text-sm font-medium mt-1 inline-block">
                        +{stats?.usersThisMonth || 0} this month
                    </span>
                </div>

                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">Pending Reviews</h3>
                    <p className="text-2xl sm:text-3xl font-bold text-[#05033e] mt-2">
                        {stats?.pendingApplications || 0}
                    </p>
                    <Link
                        href="/admin/applications?status=pending"
                        className="text-blue-500 text-sm font-medium mt-1 inline-block hover:underline"
                    >
                        Review now →
                    </Link>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 sm:mt-12">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Link
                        href="/admin/jobs/create"
                        className="bg-[#05033e] text-white p-4 rounded-xl hover:bg-blue-900 transition-colors flex items-center gap-3"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span className="font-medium">Create New Job</span>
                    </Link>
                    <Link
                        href="/admin/applications"
                        className="bg-white border border-gray-200 p-4 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-3"
                    >
                        <svg className="w-6 h-6 text-[#05033e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="font-medium text-gray-700">View Applications</span>
                    </Link>
                    <Link
                        href="/admin/jobs"
                        className="bg-white border border-gray-200 p-4 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-3"
                    >
                        <svg className="w-6 h-6 text-[#05033e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium text-gray-700">Manage Jobs</span>
                    </Link>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="mt-8 sm:mt-12">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Applications</h2>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {stats?.recentApplications && stats.recentApplications.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Job</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Applied</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {stats.recentApplications.map((app) => (
                                        <tr key={app._id} className="hover:bg-gray-50">
                                            <td className="px-4 py-4">
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {app.user?.firstName || 'Unknown'} {app.user?.lastName || ''}
                                                    </p>
                                                    <p className="text-sm text-gray-500">{app.user?.email || 'N/A'}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 hidden sm:table-cell">
                                                <div>
                                                    <p className="font-medium text-gray-900">{app.job?.title || 'Unknown Job'}</p>
                                                    <p className="text-sm text-gray-500">{app.job?.company || 'N/A'}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                                                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-500 hidden md:table-cell">
                                                {formatDate(app.appliedAt)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            No recent applications to show.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
