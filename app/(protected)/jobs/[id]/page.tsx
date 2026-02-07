"use client";

import { useParams } from "next/navigation";
import { BriefcaseBusiness, Clock, Wallet, MapPin, User, Loader2, Calendar, CheckCircle2, Globe } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import DOMPurify from "isomorphic-dompurify";
import SendMessageForm from "@/components/shared/SendMessageForm";
import ShareButtons from "@/components/shared/ShareButtons";


interface Job {
    _id: string;
    title: string;
    company: string;
    logo?: string;
    companyLogo?: string;
    location: string;
    category: string;
    type: string;
    salary: {
        min: number;
        max: number;
        currency: string;
        period: string;
    };
    description?: string;
    shortDescription?: string;
    responsibilities?: string[];
    skills?: string[];
    experience?: string;
    experienceLevel?: string;
    postedDate?: string;
    createdAt?: string;
}

export default function JobDetailsPage() {
    const params = useParams();
    const id = params.id as string;
    const { data: session } = useSession();

    // All hooks must be at the top level
    const [job, setJob] = useState<Job | null>(null);
    const [relatedJobs, setRelatedJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSaved, setIsSaved] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const currentScroll = window.scrollY;
            setIsScrolled((prev) => {
                // Aggressive Hysteresis to prevent flickering
                if (currentScroll > 150 && !prev) return true;
                if (currentScroll < 50 && prev) return false;
                return prev;
            });
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const fetchJobDetails = async () => {
            if (!id) return;

            try {
                setLoading(true);
                // Fetch job details
                const response = await fetch(`/api/jobs/${id}`);
                const data = await response.json();

                if (data.success) {
                    setJob(data.data);

                    // Fetch related jobs
                    fetchRelatedJobs(data.data.category);
                } else {
                    setError("Job not found");
                }

                // Check if user has applied
                if (session?.user) {
                    const appsRes = await fetch('/api/applications');
                    const appsData = await appsRes.json();
                    if (appsData.success) {
                        // Check if any application matches this job ID
                        const alreadyApplied = appsData.data.some((app: any) => app.job._id === id);
                        setHasApplied(alreadyApplied);
                    }
                }

            } catch (err) {
                console.error("Error fetching job details:", err);
                setError("Failed to load job details");
            } finally {
                setLoading(false);
            }
        };

        const fetchRelatedJobs = async (category: string) => {
            try {
                const response = await fetch(`/api/jobs`);
                const data = await response.json();

                if (data.success) {
                    const related = data.data
                        .filter((j: Job) => j.category === category && j._id !== id)
                        .slice(0, 3);
                    setRelatedJobs(related);
                }
            } catch (err) {
                console.error("Error fetching related jobs:", err);
            }
        };

        fetchJobDetails();
    }, [id, session]);

    // Conditional returns come AFTER all hooks
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f4f7f7]">
                <Loader2 className="w-10 h-10 animate-spin text-[#05033e]" />
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f4f7f7] gap-4">
                <p className="text-xl text-red-500 font-medium">{error || "Job not found"}</p>
                <Link href="/jobs" className="text-[#05033e] hover:underline">
                    Back to Jobs
                </Link>
            </div>
        );
    }

    // Helper to format salary
    const formatSalary = (salary: Job['salary']) => {
        if (!salary) return "Not disclosed";
        const { min, max, currency, period } = salary;

        const formatNum = (n: number) => {
            return n >= 1000 ? (n / 1000).toFixed(0) + 'k' : n;
        };

        return `${currency === 'USD' ? '$' : currency} ${formatNum(min)} - ${formatNum(max)} / ${period}`;
    };

    // Helper for date
    const formatDate = (dateString?: string) => {
        if (!dateString) return "Recently posted";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div className="w-full bg-[#f4f7f7] min-h-screen pb-24">
            {/* Header Section */}
            <div
                className={`w-full border-b border-gray-100 sticky top-0 z-40 transition-all duration-500 ease-in-out flex flex-col ${isScrolled
                    ? "bg-white/95 backdrop-blur-md shadow-md"
                    : "bg-white"
                    }`}
            >


                <div className={`w-full px-6 transition-all duration-500 ease-in-out ${isScrolled ? "py-3" : "py-6"}`}>
                    <div className="max-w-[95%] mx-auto">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="flex items-center gap-6">
                                {(job.companyLogo || job.logo) ? (
                                    <img
                                        src={job.companyLogo || job.logo}
                                        alt={job.company}
                                        className={`rounded-xl object-contain bg-white p-2 shadow-sm border border-gray-100 transition-all duration-300 ${isScrolled ? "w-10 h-10" : "w-16 h-16"
                                            }`}
                                    />
                                ) : (
                                    <div className={`bg-gray-100 rounded-xl flex items-center justify-center transition-all duration-300 ${isScrolled ? "w-10 h-10" : "w-16 h-16"
                                        }`}>
                                        <div className="w-8 h-8 bg-gray-200 rounded-full" />
                                    </div>
                                )}
                                <div>
                                    <div className={`overflow-hidden transition-all duration-300 ${isScrolled ? "h-0 opacity-0 mb-0" : "h-auto opacity-100 mb-3"
                                        }`}>
                                        <span className="bg-[#D3E9FD] text-[#05033e] px-4 py-1.5 rounded-full text-sm font-semibold inline-block">
                                            {formatDate(job.createdAt || job.postedDate)}
                                        </span>
                                    </div>

                                    <h1 className={`font-bold text-[#05033e] transition-all duration-300 ${isScrolled ? "text-xl mb-0" : "text-3xl mb-1"
                                        }`}>{job.title}</h1>

                                    <p className={`text-gray-500 font-medium transition-all duration-300 ${isScrolled ? "text-xs mb-0" : "text-base mb-4"
                                        }`}>{job.company}</p>

                                    <div className={`flex flex-wrap items-center gap-4 text-sm text-gray-600 font-medium overflow-hidden transition-all duration-300 ${isScrolled ? "max-h-0 opacity-0 mt-0" : "max-h-20 opacity-100 mt-0"
                                        }`}>
                                        <div className="flex items-center gap-2">
                                            <BriefcaseBusiness size={20} className="text-[#05033e]" />
                                            <span>{job.category}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock size={20} className="text-[#05033e]" />
                                            <span>{job.type}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Wallet size={20} className="text-[#05033e]" />
                                            <span>{formatSalary(job.salary)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin size={20} className="text-[#05033e]" />
                                            <span>{job.location}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-3">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    {hasApplied ? (
                                        <button disabled className={`bg-green-600 text-white font-bold rounded-xl shadow-lg opacity-80 cursor-not-allowed flex items-center gap-2 transition-all duration-300 ${isScrolled ? "py-2 px-6 text-sm" : "py-3 px-8"
                                            }`}>
                                            <CheckCircle2 size={isScrolled ? 16 : 20} />
                                            Applied
                                        </button>
                                    ) : (
                                        <Link
                                            href={`/jobs/${id}/apply`}
                                            className={`bg-[#05033e] text-white font-bold rounded-xl hover:bg-[#020120] transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 text-center ${isScrolled ? "py-2 px-6 text-sm" : "py-3 px-8"
                                                }`}
                                        >
                                            Apply Now
                                        </Link>
                                    )}
                                    <button
                                        onClick={() => setIsSaved(!isSaved)}
                                        className={`bg-white text-[#05033e] font-bold rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 border border-gray-100 ${isScrolled ? "py-2 px-6 text-sm" : "py-3 px-8"
                                            }`}
                                    >
                                        {isSaved ? "Saved" : "Save Job"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <div className="max-w-[95%] mx-auto px-4 md:px-6 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12">

                {/* Left Content */}
                <div className="lg:col-span-8 space-y-12">
                    <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
                        <h2 className="text-2xl font-bold text-[#05033e] mb-6">Job Description</h2>
                        <div
                            className="text-gray-600 leading-relaxed text-lg mb-8 prose prose-lg max-w-none"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(job.description || "No description provided.") }}
                        />

                        {job.responsibilities && job.responsibilities.length > 0 && (
                            <>
                                <h2 className="text-2xl font-bold text-[#05033e] mb-6">Key Responsibilities</h2>
                                <ul className="space-y-4 mb-8">
                                    {job.responsibilities.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <div className="mt-1.5 w-5 h-5 rounded-full bg-[#D3E9FD] flex items-center justify-center flex-shrink-0">
                                                <span className="w-2 h-2 rounded-full bg-[#05033e]"></span>
                                            </div>
                                            <span className="text-gray-600 text-lg leading-relaxed">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}

                        {job.skills && job.skills.length > 0 && (
                            <>
                                <h2 className="text-2xl font-bold text-[#05033e] mb-6">Professional Skills</h2>
                                <ul className="space-y-4 mb-8">
                                    {job.skills.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <div className="mt-1.5 w-5 h-5 rounded-full bg-[#D3E9FD] flex items-center justify-center flex-shrink-0">
                                                <span className="w-2 h-2 rounded-full bg-[#05033e]"></span>
                                            </div>
                                            <span className="text-gray-600 text-lg leading-relaxed">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}

                        <div className="mt-8 border-t border-gray-100 pt-8">
                            <h3 className="text-lg font-bold text-[#05033e] mb-3">Share Job:</h3>
                            <ShareButtons
                                title={`${job.title} at ${job.company}`}
                                description={job.shortDescription || `Check out this ${job.type} position at ${job.company}`}
                            />
                        </div>
                    </div>

                    {/* Related Jobs */}
                    <div>
                        <h2 className="text-3xl font-bold text-[#05033e] mb-8">Related Jobs</h2>
                        <div className="space-y-4">
                            {relatedJobs.length > 0 ? (
                                relatedJobs.map(j => (
                                    <Link key={j._id} href={`/jobs/${j._id}`}>
                                        <div className="bg-white p-6 rounded-xl hover:shadow-md transition-shadow border border-gray-100">
                                            <h3 className="text-lg font-bold text-[#05033e] mb-1">{j.title}</h3>
                                            <p className="text-gray-600">{j.company} • {j.location}</p>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <p className="text-gray-500">No related jobs found.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="lg:col-span-4 space-y-8">

                    {/* Job Overview Card */}
                    <div className="bg-[#D3E9FD] p-8 rounded-3xl">
                        <h3 className="text-xl font-bold text-[#05033e] mb-6">Job Overview</h3>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <User className="text-[#05033e] mt-1" size={24} />
                                <div>
                                    <h4 className="font-bold text-[#05033e]">Job Title</h4>
                                    <p className="text-gray-600">{job.title}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <Clock className="text-[#05033e] mt-1" size={24} />
                                <div>
                                    <h4 className="font-bold text-[#05033e]">Job Type</h4>
                                    <p className="text-gray-600">{job.type}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <BriefcaseBusiness className="text-[#05033e] mt-1" size={24} />
                                <div>
                                    <h4 className="font-bold text-[#05033e]">Category</h4>
                                    <p className="text-gray-600">{job.category}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <Globe className="text-[#05033e] mt-1" size={24} />
                                <div>
                                    <h4 className="font-bold text-[#05033e]">Experience</h4>
                                    <p className="text-gray-600">{job.experienceLevel || job.experience || "Not specified"}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <Wallet className="text-[#05033e] mt-1" size={24} />
                                <div>
                                    <h4 className="font-bold text-[#05033e]">Offered Salary</h4>
                                    <p className="text-gray-600">{formatSalary(job.salary)}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <MapPin className="text-[#05033e] mt-1" size={24} />
                                <div>
                                    <h4 className="font-bold text-[#05033e]">Location</h4>
                                    <p className="text-gray-600">{job.location}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <Calendar className="text-[#05033e] mt-1" size={24} />
                                <div>
                                    <h4 className="font-bold text-[#05033e]">Posted</h4>
                                    <p className="text-gray-600">{formatDate(job.createdAt || job.postedDate)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Send Message Form */}
                    <div className="bg-[#D3E9FD] p-8 rounded-3xl">
                        <h3 className="text-xl font-bold text-[#05033e] mb-6">Send Us Message</h3>
                        <SendMessageForm jobTitle={job.title} jobId={job._id} />
                    </div>

                </div>
            </div>
        </div >
    );
}
