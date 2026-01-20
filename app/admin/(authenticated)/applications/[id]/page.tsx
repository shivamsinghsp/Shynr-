'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ApplicationDetail {
    _id: string;
    job: {
        _id: string;
        title: string;
        company: string;
        location: string;
        type: string;
        salary?: {
            min: number;
            max: number;
            currency: string;
        };
    } | null;
    user: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        profileImage?: string;
        headline?: string;
        summary?: string;
        location?: string;
        linkedin?: string;
        portfolio?: string;
        skills?: string[];
        education?: Array<{
            institution: string;
            degree: string;
            fieldOfStudy: string;
            startDate: string;
            endDate?: string;
            current: boolean;
        }>;
        experience?: Array<{
            company: string;
            title: string;
            location?: string;
            startDate: string;
            endDate?: string;
            current: boolean;
            description?: string;
        }>;
        resume?: {
            url: string;
            filename: string;
        };
    } | null;
    resume: {
        url: string;
        filename: string;
    };
    coverLetter?: string;
    status: string;
    statusHistory?: Array<{
        status: string;
        changedAt: string;
        note?: string;
    }>;
    internalNotes?: string;
    rating?: number;
    appliedAt: string;
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

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function ApplicationDetailPage({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();
    const [application, setApplication] = useState<ApplicationDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updating, setUpdating] = useState(false);
    const [internalNotes, setInternalNotes] = useState('');

    useEffect(() => {
        fetchApplication();
    }, [id]);

    const fetchApplication = async () => {
        try {
            const res = await fetch(`/api/admin/applications/${id}`);
            const data = await res.json();

            if (data.success) {
                setApplication(data.data);
                setInternalNotes(data.data.internalNotes || '');
            } else {
                setError(data.error || 'Failed to load application');
            }
        } catch (err) {
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        setUpdating(true);
        try {
            const res = await fetch(`/api/admin/applications/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await res.json();
            if (data.success) {
                setApplication(prev => prev ? { ...prev, status: newStatus } : null);
            } else {
                alert(data.error || 'Failed to update status');
            }
        } catch (err) {
            alert('Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    const handleSaveNotes = async () => {
        setUpdating(true);
        try {
            const res = await fetch(`/api/admin/applications/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ internalNotes })
            });

            const data = await res.json();
            if (data.success) {
                alert('Notes saved successfully');
            } else {
                alert(data.error || 'Failed to save notes');
            }
        } catch (err) {
            alert('Failed to save notes');
        } finally {
            setUpdating(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusOption = STATUS_OPTIONS.find(s => s.value === status);
        return statusOption?.color || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#05033e]"></div>
            </div>
        );
    }

    if (error || !application) {
        return (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                {error || 'Application not found'}
                <Link href="/admin/applications" className="ml-4 underline hover:no-underline">
                    Back to Applications
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Link href="/admin/applications" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Application Details</h1>
                    <p className="text-gray-500">Applied on {formatDate(application.appliedAt)}</p>
                </div>
                <select
                    value={application.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={updating}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border-0 cursor-pointer disabled:opacity-50 ${getStatusBadge(application.status)}`}
                >
                    {STATUS_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content - Candidate Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Candidate Profile Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Candidate Profile</h2>
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-16 h-16 bg-[#05033e] rounded-full flex items-center justify-center text-white text-xl font-medium overflow-hidden">
                                {application.user?.profileImage ? (
                                    <img src={application.user.profileImage} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <>{application.user?.firstName?.[0] || 'U'}{application.user?.lastName?.[0] || ''}</>
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-900">
                                    {application.user?.firstName || 'Unknown'} {application.user?.lastName || ''}
                                </h3>
                                {application.user?.headline && (
                                    <p className="text-gray-600">{application.user.headline}</p>
                                )}
                                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        {application.user?.email || 'N/A'}
                                    </span>
                                    {application.user?.phone && (
                                        <span className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            {application.user.phone}
                                        </span>
                                    )}
                                    {application.user?.location && (
                                        <span className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            {application.user.location}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Links */}
                        <div className="flex flex-wrap gap-3 mb-6">
                            {application.user?.linkedin && (
                                <a
                                    href={application.user.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                    </svg>
                                    LinkedIn
                                </a>
                            )}
                            {application.user?.portfolio && (
                                <a
                                    href={application.user.portfolio}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                    </svg>
                                    Portfolio
                                </a>
                            )}
                            {(application.resume?.url || application.user?.resume?.url) && (
                                <a
                                    href={application.resume?.url || application.user?.resume?.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Download Resume
                                </a>
                            )}
                        </div>

                        {/* Summary */}
                        {application.user?.summary && (
                            <div className="mb-6">
                                <h4 className="font-medium text-gray-900 mb-2">About</h4>
                                <p className="text-gray-600 text-sm">{application.user.summary}</p>
                            </div>
                        )}

                        {/* Skills */}
                        {application.user?.skills && application.user.skills.length > 0 && (
                            <div className="mb-6">
                                <h4 className="font-medium text-gray-900 mb-2">Skills</h4>
                                <div className="flex flex-wrap gap-2">
                                    {application.user.skills.map((skill, i) => (
                                        <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Experience */}
                    {application.user?.experience && application.user.experience.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Experience</h2>
                            <div className="space-y-4">
                                {application.user.experience.map((exp, i) => (
                                    <div key={i} className="border-l-2 border-[#05033e] pl-4">
                                        <h4 className="font-medium text-gray-900">{exp.title}</h4>
                                        <p className="text-gray-600">{exp.company}{exp.location ? ` • ${exp.location}` : ''}</p>
                                        <p className="text-sm text-gray-500">
                                            {formatDate(exp.startDate)} - {exp.current ? 'Present' : exp.endDate ? formatDate(exp.endDate) : 'N/A'}
                                        </p>
                                        {exp.description && <p className="text-sm text-gray-600 mt-2">{exp.description}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Education */}
                    {application.user?.education && application.user.education.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Education</h2>
                            <div className="space-y-4">
                                {application.user.education.map((edu, i) => (
                                    <div key={i} className="border-l-2 border-gray-300 pl-4">
                                        <h4 className="font-medium text-gray-900">{edu.degree} in {edu.fieldOfStudy}</h4>
                                        <p className="text-gray-600">{edu.institution}</p>
                                        <p className="text-sm text-gray-500">
                                            {formatDate(edu.startDate)} - {edu.current ? 'Present' : edu.endDate ? formatDate(edu.endDate) : 'N/A'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Cover Letter */}
                    {application.coverLetter && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Cover Letter</h2>
                            <p className="text-gray-600 whitespace-pre-wrap">{application.coverLetter}</p>
                        </div>
                    )}
                </div>

                {/* Sidebar - Job Info & Admin Actions */}
                <div className="space-y-6">
                    {/* Job Applied For */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Applied For</h2>
                        <div className="space-y-2">
                            <h3 className="font-medium text-gray-900">{application.job?.title || 'Unknown Job'}</h3>
                            <p className="text-gray-600">{application.job?.company || 'N/A'}</p>
                            {application.job?.location && (
                                <p className="text-sm text-gray-500">{application.job.location}</p>
                            )}
                            {application.job?.type && (
                                <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                    {application.job.type}
                                </span>
                            )}
                            {application.job?.salary && (
                                <p className="text-sm text-gray-600">
                                    {application.job.salary.currency} {application.job.salary.min.toLocaleString()} - {application.job.salary.max.toLocaleString()}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Internal Notes */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Internal Notes</h2>
                        <textarea
                            value={internalNotes}
                            onChange={(e) => setInternalNotes(e.target.value)}
                            placeholder="Add private notes about this candidate..."
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#05033e] focus:border-transparent text-sm"
                        />
                        <button
                            onClick={handleSaveNotes}
                            disabled={updating}
                            className="mt-3 w-full py-2 bg-[#05033e] text-white rounded-lg font-medium hover:bg-blue-900 transition-colors disabled:opacity-50"
                        >
                            {updating ? 'Saving...' : 'Save Notes'}
                        </button>
                    </div>

                    {/* Status History */}
                    {application.statusHistory && application.statusHistory.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Status History</h2>
                            <div className="space-y-3">
                                {application.statusHistory.map((history, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className={`w-2 h-2 mt-2 rounded-full ${getStatusBadge(history.status).replace('text-', 'bg-').split(' ')[0]}`} />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 capitalize">{history.status}</p>
                                            <p className="text-xs text-gray-500">{formatDate(history.changedAt)}</p>
                                            {history.note && <p className="text-xs text-gray-600 mt-1">{history.note}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                        <div className="space-y-2">
                            <button
                                onClick={() => handleStatusChange('shortlisted')}
                                disabled={application.status === 'shortlisted' || updating}
                                className="w-full py-2 bg-green-50 text-green-700 rounded-lg font-medium hover:bg-green-100 transition-colors disabled:opacity-50"
                            >
                                Shortlist Candidate
                            </button>
                            <button
                                onClick={() => handleStatusChange('interview')}
                                disabled={application.status === 'interview' || updating}
                                className="w-full py-2 bg-purple-50 text-purple-700 rounded-lg font-medium hover:bg-purple-100 transition-colors disabled:opacity-50"
                            >
                                Schedule Interview
                            </button>
                            <button
                                onClick={() => handleStatusChange('rejected')}
                                disabled={application.status === 'rejected' || updating}
                                className="w-full py-2 bg-red-50 text-red-700 rounded-lg font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                            >
                                Reject Application
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
