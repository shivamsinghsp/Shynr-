"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, FileText, Mail, Phone, MapPin, Briefcase, GraduationCap, Edit2, Download } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface UserProfile {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    location?: string;
    headline?: string;
    summary?: string;
    profileImage?: string;
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
    profileCompleteness: number;
}

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/");
        }
    }, [status, router]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch("/api/users/profile");
                const data = await response.json();
                if (data.success) {
                    setProfile(data.data);
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };

        if (session) {
            fetchProfile();
        }
    }, [session]);

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#05033e]" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Profile not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-8">
            {/* Header Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                {/* Banner */}
                <div className="h-32 bg-gradient-to-r from-[#05033e] to-[#1a1a6e]" />

                {/* Profile Info */}
                <div className="px-6 pb-6">
                    <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-12">
                        {/* Avatar */}
                        <div className="relative">
                            {profile.profileImage ? (
                                <Image
                                    src={profile.profileImage}
                                    alt={`${profile.firstName} ${profile.lastName}`}
                                    width={120}
                                    height={120}
                                    className="w-28 h-28 rounded-2xl border-4 border-white shadow-lg object-cover"
                                />
                            ) : (
                                <div className="w-28 h-28 rounded-2xl border-4 border-white shadow-lg bg-[#05033e] flex items-center justify-center text-white text-3xl font-bold">
                                    {profile.firstName?.[0] || profile.email[0].toUpperCase()}
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 md:pb-2">
                            <h1 className="text-2xl font-bold text-gray-900">
                                {profile.firstName} {profile.lastName}
                            </h1>
                            {profile.headline && (
                                <p className="text-gray-600">{profile.headline}</p>
                            )}
                            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                    <Mail size={14} /> {profile.email}
                                </span>
                                {profile.phone && (
                                    <span className="flex items-center gap-1">
                                        <Phone size={14} /> {profile.phone}
                                    </span>
                                )}
                                {profile.location && (
                                    <span className="flex items-center gap-1">
                                        <MapPin size={14} /> {profile.location}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <Link
                                href="/onboarding"
                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                <Edit2 size={16} /> Edit Profile
                            </Link>
                        </div>
                    </div>

                    {/* Profile Completeness */}
                    <div className="mt-6">
                        <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-gray-600">Profile Completeness</span>
                            <span className="font-medium text-[#05033e]">{profile.profileCompleteness}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-[#05033e] to-blue-500 rounded-full transition-all duration-500"
                                style={{ width: `${profile.profileCompleteness}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                    {/* About */}
                    {profile.summary && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">About</h2>
                            <p className="text-gray-600 whitespace-pre-wrap">{profile.summary}</p>
                        </div>
                    )}

                    {/* Skills */}
                    {profile.skills && profile.skills.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Skills</h2>
                            <div className="flex flex-wrap gap-2">
                                {profile.skills.map((skill, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Resume */}
                    {profile.resume && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Resume</h2>
                            <a
                                href={profile.resume.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                            >
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <FileText className="text-blue-600" size={24} />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900">{profile.resume.filename}</p>
                                    <p className="text-sm text-gray-500">Click to download</p>
                                </div>
                                <Download className="text-gray-400" size={20} />
                            </a>
                        </div>
                    )}
                </div>

                {/* Right Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Experience */}
                    {profile.experience && profile.experience.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Briefcase size={20} className="text-[#05033e]" /> Experience
                            </h2>
                            <div className="space-y-6">
                                {profile.experience.map((exp, index) => (
                                    <div key={index} className="border-l-2 border-gray-200 pl-4">
                                        <h3 className="font-medium text-gray-900">{exp.title}</h3>
                                        <p className="text-gray-600">{exp.company}</p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(exp.startDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                                            {" - "}
                                            {exp.current ? "Present" : exp.endDate && new Date(exp.endDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                                            {exp.location && ` • ${exp.location}`}
                                        </p>
                                        {exp.description && (
                                            <p className="text-gray-600 mt-2 text-sm">{exp.description}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Education */}
                    {profile.education && profile.education.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <GraduationCap size={20} className="text-[#05033e]" /> Education
                            </h2>
                            <div className="space-y-6">
                                {profile.education.map((edu, index) => (
                                    <div key={index} className="border-l-2 border-gray-200 pl-4">
                                        <h3 className="font-medium text-gray-900">{edu.institution}</h3>
                                        <p className="text-gray-600">{edu.degree} in {edu.fieldOfStudy}</p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(edu.startDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                                            {" - "}
                                            {edu.current ? "Present" : edu.endDate && new Date(edu.endDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
