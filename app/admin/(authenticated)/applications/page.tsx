'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Download, CheckSquare, Square, Mail } from 'lucide-react';

interface Application {
    _id: string;
    job: {
        _id: string;
        title: string;
        company: string;
        location: string;
    } | null;
    user: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        profileImage?: string;
    } | null;
    resume: {
        url: string;
        filename: string;
    };
    status: 'pending' | 'reviewed' | 'shortlisted' | 'interview' | 'offered' | 'rejected' | 'withdrawn';
    appliedAt: string;
    rating?: number;
}

const STATUS_OPTIONS = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'reviewed', label: 'Reviewed', color: 'bg-blue-100 text-blue-800' },
    { value: 'shortlisted', label: 'Shortlisted', color: 'bg-green-100 text-green-800' },
    { value: 'interview', label: 'Interview', color: 'bg-purple-100 text-purple-800' },
    { value: 'offered', label: 'Offered', color: 'bg-emerald-100 text-emerald-800' },
    { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' },
    { value: 'withdrawn', label: 'Withdrawn', color: 'bg-gray-100 text-gray-800' },
];

export default function AdminApplicationsPage() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [bulkStatus, setBulkStatus] = useState('');
    const [bulkLoading, setBulkLoading] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);
    const [emailNotification, setEmailNotification] = useState<string | null>(null);

    useEffect(() => {
        fetchApplications();
    }, [statusFilter]);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (statusFilter) params.append('status', statusFilter);

            const res = await fetch(`/api/admin/applications?${params.toString()}`);
            const data = await res.json();

            if (data.success) {
                setApplications(data.data);
                setSelectedIds([]); // Reset selection
            } else {
                setError(data.error || 'Failed to load applications');
            }
        } catch (err) {
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (appId: string, newStatus: string) => {
        setUpdatingId(appId);
        try {
            const res = await fetch(`/api/admin/applications/${appId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await res.json();
            if (data.success) {
                setApplications(applications.map(app =>
                    app._id === appId ? { ...app, status: newStatus as Application['status'] } : app
                ));
                if (data.emailSent) {
                    setEmailNotification('Email notification sent to applicant');
                    setTimeout(() => setEmailNotification(null), 3000);
                }
            } else {
                alert(data.error || 'Failed to update status');
            }
        } catch (err) {
            alert('Failed to update status');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleSelectAll = () => {
        if (selectedIds.length === applications.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(applications.map(app => app._id));
        }
    };

    const handleSelectOne = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(sid => sid !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleBulkStatusChange = async () => {
        if (!bulkStatus || selectedIds.length === 0) return;

        setBulkLoading(true);
        try {
            const promises = selectedIds.map(id =>
                fetch(`/api/admin/applications/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: bulkStatus })
                })
            );

            await Promise.all(promises);

            setApplications(applications.map(app =>
                selectedIds.includes(app._id)
                    ? { ...app, status: bulkStatus as Application['status'] }
                    : app
            ));

            setEmailNotification(`Status updated for ${selectedIds.length} applications. Email notifications sent.`);
            setTimeout(() => setEmailNotification(null), 3000);

            setSelectedIds([]);
            setBulkStatus('');
        } catch (err) {
            alert('Failed to update some applications');
        } finally {
            setBulkLoading(false);
        }
    };

    const handleExport = async (exportSelected = false) => {
        setExportLoading(true);
        try {
            const params = new URLSearchParams();
            if (statusFilter) params.append('status', statusFilter);
            if (exportSelected && selectedIds.length > 0) {
                params.append('ids', selectedIds.join(','));
            }

            const res = await fetch(`/api/admin/applications/export?${params.toString()}`);
            const blob = await res.blob();

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `applications-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        } catch (err) {
            alert('Failed to export applications');
        } finally {
            setExportLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusOption = STATUS_OPTIONS.find(s => s.value === status);
        return statusOption?.color || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div>
            {/* Email Notification Toast */}
            {emailNotification && (
                <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-right">
                    <Mail className="w-5 h-5" />
                    {emailNotification}
                </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Applications</h1>
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Export Button */}
                    <button
                        onClick={() => handleExport(false)}
                        disabled={exportLoading}
                        className="px-4 py-2 bg-[#05033e] text-white rounded-lg hover:bg-blue-900 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        <Download className="w-4 h-4" />
                        {exportLoading ? 'Exporting...' : 'Export All'}
                    </button>

                    <span className="text-sm text-gray-500">Filter:</span>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#05033e] focus:border-transparent"
                    >
                        <option value="">All Statuses</option>
                        {STATUS_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedIds.length > 0 && (
                <div className="bg-[#05033e] text-white p-4 rounded-xl mb-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top">
                    <span className="font-medium">
                        {selectedIds.length} application{selectedIds.length > 1 ? 's' : ''} selected
                    </span>
                    <div className="flex items-center gap-3">
                        <select
                            value={bulkStatus}
                            onChange={(e) => setBulkStatus(e.target.value)}
                            className="px-3 py-2 rounded-lg text-gray-900 text-sm"
                        >
                            <option value="">Change Status To...</option>
                            {STATUS_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <button
                            onClick={handleBulkStatusChange}
                            disabled={!bulkStatus || bulkLoading}
                            className="px-4 py-2 bg-white text-[#05033e] rounded-lg font-medium hover:bg-gray-100 disabled:opacity-50"
                        >
                            {bulkLoading ? 'Updating...' : 'Apply'}
                        </button>
                        <button
                            onClick={() => handleExport(true)}
                            disabled={exportLoading}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Export Selected
                        </button>
                        <button
                            onClick={() => setSelectedIds([])}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            )}

            {/* Applications List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#05033e]"></div>
                </div>
            ) : error ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                    {error}
                    <button onClick={fetchApplications} className="ml-4 underline hover:no-underline">Try again</button>
                </div>
            ) : applications.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-500">No applications found</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Desktop Table */}
                    <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left">
                                        <button
                                            onClick={handleSelectAll}
                                            className="p-1 hover:bg-gray-200 rounded"
                                        >
                                            {selectedIds.length === applications.length ? (
                                                <CheckSquare className="w-5 h-5 text-[#05033e]" />
                                            ) : (
                                                <Square className="w-5 h-5 text-gray-400" />
                                            )}
                                        </button>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applied</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resume</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {applications.map((app) => (
                                    <tr key={app._id} className={`hover:bg-gray-50 ${selectedIds.includes(app._id) ? 'bg-blue-50' : ''}`}>
                                        <td className="px-4 py-4">
                                            <button
                                                onClick={() => handleSelectOne(app._id)}
                                                className="p-1 hover:bg-gray-200 rounded"
                                            >
                                                {selectedIds.includes(app._id) ? (
                                                    <CheckSquare className="w-5 h-5 text-[#05033e]" />
                                                ) : (
                                                    <Square className="w-5 h-5 text-gray-400" />
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-[#05033e] rounded-full flex items-center justify-center text-white font-medium">
                                                    {app.user?.firstName?.[0] || 'U'}{app.user?.lastName?.[0] || ''}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {app.user?.firstName || 'Unknown'} {app.user?.lastName || ''}
                                                    </p>
                                                    <p className="text-sm text-gray-500">{app.user?.email || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div>
                                                <p className="font-medium text-gray-900">{app.job?.title || 'Unknown Job'}</p>
                                                <p className="text-sm text-gray-500">{app.job?.company || 'N/A'}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <select
                                                value={app.status}
                                                onChange={(e) => handleStatusChange(app._id, e.target.value)}
                                                disabled={updatingId === app._id}
                                                className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer disabled:opacity-50 ${getStatusBadge(app.status)}`}
                                            >
                                                {STATUS_OPTIONS.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-500">
                                            {formatDate(app.appliedAt)}
                                        </td>
                                        <td className="px-4 py-4">
                                            {app.resume?.url ? (
                                                <a
                                                    href={app.resume.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    Download
                                                </a>
                                            ) : (
                                                <span className="text-gray-400 text-sm">No resume</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            <Link
                                                href={`/admin/applications/${app._id}`}
                                                className="text-[#05033e] hover:text-blue-800 text-sm font-medium"
                                            >
                                                View Details
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="lg:hidden divide-y divide-gray-100">
                        {applications.map((app) => (
                            <div key={app._id} className={`p-4 ${selectedIds.includes(app._id) ? 'bg-blue-50' : ''}`}>
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleSelectOne(app._id)}
                                            className="p-1"
                                        >
                                            {selectedIds.includes(app._id) ? (
                                                <CheckSquare className="w-5 h-5 text-[#05033e]" />
                                            ) : (
                                                <Square className="w-5 h-5 text-gray-400" />
                                            )}
                                        </button>
                                        <div className="w-10 h-10 bg-[#05033e] rounded-full flex items-center justify-center text-white font-medium">
                                            {app.user?.firstName?.[0] || 'U'}{app.user?.lastName?.[0] || ''}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {app.user?.firstName || 'Unknown'} {app.user?.lastName || ''}
                                            </p>
                                            <p className="text-sm text-gray-500">{app.user?.email || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <p className="text-sm font-medium text-gray-900">{app.job?.title || 'Unknown Job'}</p>
                                    <p className="text-sm text-gray-500">{app.job?.company} • {formatDate(app.appliedAt)}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <select
                                        value={app.status}
                                        onChange={(e) => handleStatusChange(app._id, e.target.value)}
                                        disabled={updatingId === app._id}
                                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border-0 ${getStatusBadge(app.status)}`}
                                    >
                                        {STATUS_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                    {app.resume?.url && (
                                        <a
                                            href={app.resume.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </a>
                                    )}
                                    <Link
                                        href={`/admin/applications/${app._id}`}
                                        className="p-2 bg-[#05033e] text-white rounded-lg hover:bg-blue-900"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
