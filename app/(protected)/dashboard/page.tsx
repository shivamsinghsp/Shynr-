"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    Briefcase, FileText, Eye, Clock,
    CheckCircle2, XCircle, Loader2,
    TrendingUp, Calendar
} from "lucide-react";
import Link from "next/link";

interface Application {
    _id: string;
    job: {
        _id: string;
        title: string;
        company: string;
        companyLogo?: string;
        location: string;
    };
    status: string;
    appliedAt: string;
}

interface DashboardStats {
    totalApplications: number;
    pending: number;
    reviewed: number;
    shortlisted: number;
    profileCompleteness: number;
}

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [applications, setApplications] = useState<Application[]>([]);
    const [stats, setStats] = useState<DashboardStats>({
        totalApplications: 0,
        pending: 0,
        reviewed: 0,
        shortlisted: 0,
        profileCompleteness: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/");
        }
    }, [status, router]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [applicationsRes, profileRes] = await Promise.all([
                    fetch("/api/applications"),
                    fetch("/api/users/profile"),
                ]);

                const applicationsData = await applicationsRes.json();
                const profileData = await profileRes.json();

                if (applicationsData.success) {
                    setApplications(applicationsData.data.slice(0, 5));
                    const apps = applicationsData.data;
                    setStats({
                        totalApplications: apps.length,
                        pending: apps.filter((a: Application) => a.status === "pending").length,
                        reviewed: apps.filter((a: Application) => a.status === "reviewed").length,
                        shortlisted: apps.filter((a: Application) =>
                            ["shortlisted", "interview", "offered"].includes(a.status)
                        ).length,
                        profileCompleteness: profileData.success ? profileData.data.profileCompleteness || 0 : 0,
                    });
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (session) {
            fetchData();
        }
    }, [session]);

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#05033e]" />
            </div>
        );
    }

    const statusColors: Record<string, string> = {
        pending: "bg-yellow-100 text-yellow-800",
        reviewed: "bg-blue-100 text-blue-800",
        shortlisted: "bg-green-100 text-green-800",
        interview: "bg-purple-100 text-purple-800",
        offered: "bg-emerald-100 text-emerald-800",
        rejected: "bg-red-100 text-red-800",
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">
                    Welcome back, {session?.user?.name || "User"}!
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Applications</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalApplications}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-xl">
                            <Briefcase className="text-blue-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Pending Review</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pending}</p>
                        </div>
                        <div className="p-3 bg-yellow-100 rounded-xl">
                            <Clock className="text-yellow-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Shortlisted</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.shortlisted}</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-xl">
                            <CheckCircle2 className="text-green-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Profile Completeness</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.profileCompleteness}%</p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-xl">
                            <TrendingUp className="text-purple-600" size={24} />
                        </div>
                    </div>
                    {stats.profileCompleteness < 100 && (
                        <Link href="/profile" className="text-xs text-[#05033e] hover:underline mt-2 block">
                            Complete your profile →
                        </Link>
                    )}
                </div>
            </div>

            {/* Recent Applications */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Recent Applications</h2>
                    <Link href="/applications" className="text-sm text-[#05033e] hover:underline">
                        View all →
                    </Link>
                </div>

                {applications.length > 0 ? (
                    <div className="space-y-4">
                        {applications.map((app) => (
                            <div
                                key={app._id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center">
                                        <Briefcase className="text-gray-400" size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">{app.job.title}</h3>
                                        <p className="text-sm text-gray-600">{app.job.company}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[app.status]}`}>
                                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                    </span>
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <Calendar size={14} />
                                        {new Date(app.appliedAt).toLocaleDateString('en-GB')}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <FileText className="mx-auto text-gray-300 mb-4" size={48} />
                        <p className="text-gray-500 mb-4">No applications yet</p>
                        <Link
                            href="/jobs"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#05033e] text-white rounded-xl font-medium hover:bg-[#020120] transition-colors"
                        >
                            <Eye size={18} />
                            Browse Jobs
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
