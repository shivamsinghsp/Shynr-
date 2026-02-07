'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Job {
    _id: string;
    title: string;
    company: string;
    location: string;
    type: string;
    status: 'draft' | 'published' | 'closed' | 'archived';
    applicationCount: number;
    viewCount: number;
    createdAt: string;
    applicationDeadline?: string;
}

export default function AdminJobsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('');
    const [search, setSearch] = useState('');
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        fetchJobs();
    }, [filter]);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filter) params.append('status', filter);
            if (search) params.append('search', search);

            const res = await fetch(`/api/admin/jobs?${params.toString()}`, { cache: 'no-store' });
            const data = await res.json();

            if (data.success) {
                setJobs(data.data);
            } else {
                setError(data.error || 'Failed to load jobs');
            }
        } catch (err) {
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchJobs();
    };

    const handleStatusChange = async (jobId: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/admin/jobs/${jobId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await res.json();
            if (data.success) {
                setJobs(jobs.map(job =>
                    job._id === jobId ? { ...job, status: newStatus as Job['status'] } : job
                ));
            } else {
                alert(data.error || 'Failed to update status');
            }
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const handleDelete = async (jobId: string) => {
        if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
            return;
        }

        setDeleting(jobId);
        try {
            const res = await fetch(`/api/admin/jobs/${jobId}`, {
                method: 'DELETE'
            });

            const data = await res.json();
            if (data.success) {
                setJobs(jobs.filter(job => job._id !== jobId));
            } else {
                alert(data.error || 'Failed to delete job');
            }
        } catch (err) {
            alert('Failed to delete job');
        } finally {
            setDeleting(null);
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            draft: 'bg-gray-100 text-gray-800',
            published: 'bg-green-100 text-green-800',
            closed: 'bg-red-100 text-red-800',
            archived: 'bg-yellow-100 text-yellow-800'
        };
        return styles[status] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Job Management</h1>
                <Link
                    href="/admin/jobs/create"
                    className="inline-flex items-center justify-center gap-2 bg-[#05033e] text-white px-4 py-2 rounded-lg hover:bg-blue-900 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Job
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <form onSubmit={handleSearch} className="flex-1">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search jobs..."
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
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#05033e] focus:border-transparent"
                    >
                        <option value="">All Status</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="closed">Closed</option>
                        <option value="archived">Archived</option>
                    </select>
                </div>
            </div>

            {/* Jobs List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#05033e]"></div>
                </div>
            ) : error ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                    {error}
                    <button onClick={fetchJobs} className="ml-4 underline hover:no-underline">Try again</button>
                </div>
            ) : jobs.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-500 mb-4">No jobs found</p>
                    <Link href="/admin/jobs/create" className="text-[#05033e] font-medium hover:underline">
                        Create your first job →
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Desktop Table */}
                    <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applications</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {jobs.map((job) => (
                                    <tr key={job._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-4">
                                            <div>
                                                <p className="font-medium text-gray-900">{job.title}</p>
                                                <p className="text-sm text-gray-500">{job.company}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-600">{job.location}</td>
                                        <td className="px-4 py-4 text-sm text-gray-600">{job.type}</td>
                                        <td className="px-4 py-4">
                                            <select
                                                value={job.status}
                                                onChange={(e) => handleStatusChange(job._id, e.target.value)}
                                                className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${getStatusBadge(job.status)}`}
                                            >
                                                <option value="draft">Draft</option>
                                                <option value="published">Published</option>
                                                <option value="closed">Closed</option>
                                                <option value="archived">Archived</option>
                                            </select>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-600">{job.applicationCount}</td>
                                        <td className="px-4 py-4 text-sm text-gray-500">{formatDate(job.createdAt)}</td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/admin/jobs/${job._id}/edit`}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(job._id)}
                                                    disabled={deleting === job._id}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Delete"
                                                >
                                                    {deleting === job._id ? (
                                                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="lg:hidden divide-y divide-gray-100">
                        {jobs.map((job) => (
                            <div key={job._id} className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h3 className="font-medium text-gray-900">{job.title}</h3>
                                        <p className="text-sm text-gray-500">{job.company}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(job.status)}`}>
                                        {job.status}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2 text-sm text-gray-500 mb-3">
                                    <span>{job.location}</span>
                                    <span>•</span>
                                    <span>{job.type}</span>
                                    <span>•</span>
                                    <span>{job.applicationCount} Applications</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/admin/jobs/${job._id}/edit`}
                                        className="flex-1 text-center py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                                    >
                                        Edit
                                    </Link>
                                    <select
                                        value={job.status}
                                        onChange={(e) => handleStatusChange(job._id, e.target.value)}
                                        className="flex-1 py-2 px-3 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium border-0"
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="published">Published</option>
                                        <option value="closed">Closed</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                    <button
                                        onClick={() => handleDelete(job._id)}
                                        disabled={deleting === job._id}
                                        className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                    >
                                        {deleting === job._id ? (
                                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
