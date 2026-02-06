"use client";

import { useParams } from "next/navigation";
import { BriefcaseBusiness, Clock, Wallet, MapPin, User, Mail, Phone, MessageSquare, Linkedin, Facebook, Globe, Share2, Loader2, Calendar, CheckCircle2, Check } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useMemo, useRef } from "react";
import { useSession } from "next-auth/react";
import DOMPurify from "isomorphic-dompurify";


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

// Send Message Form Component with state management
function SendMessageForm({ jobTitle, jobId }: { jobTitle: string; jobId: string }) {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMessage('');

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    message: formData.message,
                    jobTitle,
                    jobId
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setStatus('success');
                setFormData({ name: '', email: '', phone: '', message: '' });
                setTimeout(() => setStatus('idle'), 5000);
            } else {
                setStatus('error');
                setErrorMessage(data.error || 'Failed to send message');
                setTimeout(() => setStatus('idle'), 5000);
            }
        } catch {
            setStatus('error');
            setErrorMessage('Network error. Please try again.');
            setTimeout(() => setStatus('idle'), 5000);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Full name"
                    required
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-[#05033e]/20 bg-white"
                />
            </div>
            <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Email Address"
                    required
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-[#05033e]/20 bg-white"
                />
            </div>
            <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Phone Number"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-[#05033e]/20 bg-white"
                />
            </div>
            <div className="relative">
                <MessageSquare className="absolute left-4 top-4 text-gray-400" size={18} />
                <textarea
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Your Message"
                    rows={4}
                    required
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-[#05033e]/20 resize-none bg-white"
                />
            </div>
            <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-[#05033e] text-white font-bold py-3 rounded-xl hover:bg-[#020120] transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {status === 'loading' ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending...
                    </>
                ) : 'Send Message'}
            </button>
            {status === 'success' && (
                <p className="text-green-600 text-sm text-center font-semibold">
                    ✓ Message sent successfully!
                </p>
            )}
            {status === 'error' && (
                <p className="text-red-600 text-sm text-center font-semibold">
                    ✕ {errorMessage}
                </p>
            )}
        </form>
    );
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
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const handleSocialShare = (platform: 'facebook' | 'linkedin') => {
        const url = encodeURIComponent(window.location.href);
        let shareUrl = '';

        if (platform === 'facebook') {
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        } else if (platform === 'linkedin') {
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        }

        window.open(shareUrl, '_blank', 'width=600,height=400');
    };

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
                className={`w-full border-b border-gray-100 px-6 sticky top-0 z-50 transition-all duration-500 ease-in-out ${isScrolled
                    ? "bg-white/95 backdrop-blur-md shadow-md py-4"
                    : "bg-white py-12"
                    }`}
            >
                <div className="max-w-[95%] mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-6">
                            {(job.companyLogo || job.logo) ? (
                                <img
                                    src={job.companyLogo || job.logo}
                                    alt={job.company}
                                    className={`rounded-xl object-contain bg-white p-2 shadow-sm border border-gray-100 transition-all duration-300 ${isScrolled ? "w-12 h-12" : "w-20 h-20"
                                        }`}
                                />
                            ) : (
                                <div className={`bg-gray-100 rounded-xl flex items-center justify-center transition-all duration-300 ${isScrolled ? "w-12 h-12" : "w-20 h-20"
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

                                <h1 className={`font-bold text-[#05033e] transition-all duration-300 ${isScrolled ? "text-2xl mb-0" : "text-4xl mb-2"
                                    }`}>{job.title}</h1>

                                <p className={`text-gray-500 font-medium transition-all duration-300 ${isScrolled ? "text-sm mb-0" : "text-lg mb-6"
                                    }`}>{job.company}</p>

                                <div className={`flex flex-wrap items-center gap-6 text-gray-600 font-medium overflow-hidden transition-all duration-300 ${isScrolled ? "max-h-0 opacity-0 mt-0" : "max-h-20 opacity-100 mt-0"
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
                            <div className="flex gap-4">
                                <button
                                    onClick={() => handleSocialShare('facebook')}
                                    className="p-3 bg-gray-50 rounded-full hover:bg-[#05033e] hover:text-white transition-colors text-[#05033e] cursor-pointer"
                                    aria-label="Share on Facebook"
                                >
                                    <Facebook size={20} />
                                </button>
                                <button
                                    onClick={() => handleSocialShare('linkedin')}
                                    className="p-3 bg-gray-50 rounded-full hover:bg-[#05033e] hover:text-white transition-colors text-[#05033e] cursor-pointer"
                                    aria-label="Share on LinkedIn"
                                >
                                    <Linkedin size={20} />
                                </button>
                                <button
                                    onClick={handleShare}
                                    className="p-3 bg-gray-50 rounded-full hover:bg-[#05033e] hover:text-white transition-colors text-[#05033e] cursor-pointer"
                                    aria-label="Copy Link"
                                >
                                    {copied ? <Check size={20} /> : <Share2 size={20} />}
                                </button>
                            </div>
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
        </div>
    );
}
