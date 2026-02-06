"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, Briefcase, MapPin, Calendar, ExternalLink, Clock } from "lucide-react";
import Link from "next/link";

interface Application {
    _id: string;
    job: {
        _id: string;
        title: string;
        company: string;
        companyLogo?: string;
        location: string;
        type: string;
        salary: {
            min: number;
            max: number;
            currency: string;
        };
        status: string;
    };
    status: string;
    appliedAt: string;
    statusHistory: Array<{
        status: string;
        changedAt: string;
        note?: string;
    }>;
}

export default function ApplicationsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/");
        }
    }, [status, router]);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch("/api/applications");

            if (!response.ok) {
                throw new Error('Failed to fetch applications');
            }

            const data = await response.json();
            if (data.success) {
                setApplications(data.data);
            } else {
                setError(data.error || "Failed to load applications");
            }
        } catch (error) {
            console.error("Error fetching applications:", error);
            setError("Unable to load your applications. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session) {
            fetchApplications();
        } else if (status === "loading") {
            // Wait
        } else {
            setLoading(false);
        }
    }, [session, status]);

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#05033e]" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="text-center max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Briefcase className="text-red-500" size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Something went wrong</h3>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={fetchApplications}
                        className="bg-[#05033e] text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-[#020120] transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const statusColors: Record<string, string> = {
        pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
        reviewed: "bg-blue-100 text-blue-800 border-blue-200",
        shortlisted: "bg-green-100 text-green-800 border-green-200",
        interview: "bg-purple-100 text-purple-800 border-purple-200",
        offered: "bg-emerald-100 text-emerald-800 border-emerald-200",
        rejected: "bg-red-100 text-red-800 border-red-200",
        withdrawn: "bg-gray-100 text-gray-800 border-gray-200",
    };

    const filteredApplications = filter === "all"
        ? applications
        : applications.filter(app => app.status === filter);

    const statusCounts = {
        all: applications.length,
        pending: applications.filter(a => a.status === "pending").length,
        reviewed: applications.filter(a => a.status === "reviewed").length,
        shortlisted: applications.filter(a => a.status === "shortlisted").length,
        interview: applications.filter(a => a.status === "interview").length,
        offered: applications.filter(a => a.status === "offered").length,
        rejected: applications.filter(a => a.status === "rejected").length,
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
                <p className="text-gray-600 mt-1">Track your job applications</p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
                {Object.entries(statusCounts).map(([key, count]) => (
                    <button
                        key={key}
                        onClick={() => setFilter(key)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === key
                            ? "bg-[#05033e] text-white"
                            : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                            }`}
                    >
                        {key.charAt(0).toUpperCase() + key.slice(1)} ({count})
                    </button>
                ))}
            </div>

            {/* Applications List */}
            {filteredApplications.length > 0 ? (
                <div className="space-y-4">
                    {filteredApplications.map((app) => (
                        <div
                            key={app._id}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Briefcase className="text-gray-400" size={24} />
                                    </div>
                                    <div>
                                        {/* Null Safety Check for Job */}
                                        {app.job ? (
                                            <>
                                                <h3 className="font-semibold text-gray-900 text-lg">{app.job.title}</h3>
                                                <p className="text-gray-600">{app.job.company}</p>
                                                <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <MapPin size={14} /> {app.job.location}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={14} /> {app.job.type}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={14} /> Applied {new Date(app.appliedAt).toLocaleDateString('en-GB')}
                                                    </span>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <h3 className="font-semibold text-gray-400 text-lg italic">Job Unavailable</h3>
                                                <p className="text-gray-400 italic">This job listing has been removed.</p>
                                                <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-400">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={14} /> Applied {new Date(app.appliedAt).toLocaleDateString('en-GB')}
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <span className={`px-4 py-2 rounded-full text-sm font-medium border ${statusColors[app.status]}`}>
                                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                    </span>
                                    {app.job && (
                                        <Link
                                            href={`/jobs/${app.job._id}`}
                                            className="p-2 text-gray-400 hover:text-[#05033e] transition-colors"
                                        >
                                            <ExternalLink size={20} />
                                        </Link>
                                    )}
                                </div>
                            </div>

                            {/* Status Timeline */}
                            {app.statusHistory && app.statusHistory.length > 1 && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Status History</p>
                                    <div className="flex flex-wrap gap-2">
                                        {app.statusHistory.map((history, index) => (
                                            <span
                                                key={index}
                                                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                                            >
                                                {history.status} - {new Date(history.changedAt).toLocaleDateString('en-GB')}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <Briefcase className="mx-auto text-gray-300 mb-4" size={48} />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
                    <p className="text-gray-500 mb-6">
                        {filter === "all"
                            ? "You haven't applied to any jobs yet."
                            : `No applications with status "${filter}".`}
                    </p>
                    <Link
                        href="/jobs"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#05033e] text-white rounded-xl font-medium hover:bg-[#020120] transition-colors"
                    >
                        Browse Jobs
                    </Link>
                </div>
            )}
        </div>
    );
}
