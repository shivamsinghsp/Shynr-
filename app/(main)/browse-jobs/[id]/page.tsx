"use client";

import { useParams } from "next/navigation";
import { BriefcaseBusiness, Clock, Wallet, MapPin, User, Mail, Phone, MessageSquare, Linkedin, Facebook, Globe, Share2, Loader2, Calendar } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
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
    salary: { min: number; max: number; currency: string; period: string; };
    description?: string;
    shortDescription?: string;
    responsibilities?: string[];
    skills?: string[];
    experience?: string;
    experienceLevel?: string;
    postedDate?: string;
    createdAt?: string;
}

export default function PublicJobDetailsPage() {
    const params = useParams();
    const id = params.id as string;

    const [job, setJob] = useState<Job | null>(null);
    const [relatedJobs, setRelatedJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSaved, setIsSaved] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setIsScrolled(true);
            } else if (window.scrollY < 30) {
                setIsScrolled(false);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const fetchJobDetails = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const response = await fetch(`/api/jobs/${id}`);
                const data = await response.json();
                if (data.success) {
                    setJob(data.data);
                    fetchRelatedJobs(data.data.category);
                } else { setError("Job not found"); }
            } catch (err) {
                console.error("Error fetching job:", err);
                setError("Failed to load job details");
            } finally { setLoading(false); }
        };

        const fetchRelatedJobs = async (category: string) => {
            try {
                const response = await fetch(`/api/jobs`);
                const data = await response.json();
                if (data.success) {
                    const related = data.data.filter((j: Job) => j.category === category && j._id !== id).slice(0, 3);
                    setRelatedJobs(related);
                }
            } catch (err) { console.error("Error fetching related jobs:", err); }
        };

        fetchJobDetails();
    }, [id]);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#f4f7f7]"><Loader2 className="w-10 h-10 animate-spin text-[#05033e]" /></div>;
    if (error || !job) return <div className="min-h-screen flex flex-col items-center justify-center bg-[#f4f7f7] gap-4"><p className="text-xl text-red-500 font-medium">{error || "Job not found"}</p><Link href="/browse-jobs" className="text-[#05033e] hover:underline">Back to Jobs</Link></div>;

    const formatSalary = (salary: Job['salary']) => {
        if (!salary) return "Not disclosed";
        const { min, max, currency, period } = salary;
        const formatNum = (n: number) => n >= 1000 ? (n / 1000).toFixed(0) + 'k' : n;
        return `${currency === 'USD' ? '$' : currency} ${formatNum(min)} - ${formatNum(max)} / ${period}`;
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "Recently posted";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div className="w-full bg-[#f4f7f7] min-h-screen pb-24">
            {/* Header */}
            <div className={`w-full border-b border-gray-100 px-6 sticky top-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white/80 backdrop-blur-md shadow-md py-4" : "bg-white py-12"}`}>
                <div className="max-w-[95%] mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-6">
                            {(job.companyLogo || job.logo) ? (
                                <img src={job.companyLogo || job.logo} alt={job.company} className={`rounded-xl object-contain bg-white p-2 shadow-sm border border-gray-100 transition-all duration-300 ${isScrolled ? "w-14 h-14" : "w-32 h-32"}`} />
                            ) : (
                                <div className={`bg-gray-100 rounded-xl flex items-center justify-center transition-all duration-300 ${isScrolled ? "w-14 h-14" : "w-32 h-32"}`}><div className="w-12 h-12 bg-gray-200 rounded-full" /></div>
                            )}
                            <div>
                                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isScrolled ? "max-h-0 opacity-0 mb-0" : "max-h-[50px] opacity-100 mb-3"}`}>
                                    <span className="bg-[#D3E9FD] text-[#05033e] px-4 py-1.5 rounded-full text-sm font-semibold inline-block">{formatDate(job.createdAt || job.postedDate)}</span>
                                </div>
                                <h1 className={`font-bold text-[#05033e] transition-all duration-300 ${isScrolled ? "text-2xl mb-0" : "text-4xl mb-2"}`}>{job.title}</h1>
                                <p className={`text-gray-500 font-medium transition-all duration-300 ${isScrolled ? "text-sm mb-0" : "text-lg mb-6"}`}>{job.company}</p>
                                <div className={`flex flex-wrap items-center gap-6 text-gray-600 font-medium overflow-hidden transition-all duration-500 ease-in-out ${isScrolled ? "max-h-0 opacity-0 mt-0" : "max-h-[100px] opacity-100 mt-0"}`}>
                                    <div className="flex items-center gap-2"><BriefcaseBusiness size={20} className="text-[#05033e]" /><span>{job.category}</span></div>
                                    <div className="flex items-center gap-2"><Clock size={20} className="text-[#05033e]" /><span>{job.type}</span></div>
                                    <div className="flex items-center gap-2"><Wallet size={20} className="text-[#05033e]" /><span>{formatSalary(job.salary)}</span></div>
                                    <div className="flex items-center gap-2"><MapPin size={20} className="text-[#05033e]" /><span>{job.location}</span></div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                            <div className="flex flex-col sm:flex-row gap-4">
                                {/* Link to PUBLIC apply page at /apply/[id] */}
                                <Link href={`/apply/${id}`} className={`bg-[#05033e] text-white font-bold rounded-xl hover:bg-[#020120] transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 text-center ${isScrolled ? "py-2 px-6 text-sm" : "py-3 px-8"}`}>Apply Now</Link>
                                <button onClick={() => setIsSaved(!isSaved)} className={`bg-white text-[#05033e] font-bold rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 border border-gray-100 ${isScrolled ? "py-2 px-6 text-sm" : "py-3 px-8"}`}>{isSaved ? "Saved" : "Save Job"}</button>
                            </div>
                            <Link href="/auth/signin" className="text-sm text-gray-500 hover:text-[#05033e] transition-colors">Sign in for more features →</Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[95%] mx-auto px-4 md:px-6 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left Content */}
                <div className="lg:col-span-8 space-y-12">
                    <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
                        <h2 className="text-2xl font-bold text-[#05033e] mb-6">Job Description</h2>
                        <div className="text-gray-600 leading-relaxed text-lg mb-8 prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(job.description || "No description provided.") }} />

                        {job.responsibilities && job.responsibilities.length > 0 && (
                            <>
                                <h2 className="text-2xl font-bold text-[#05033e] mb-6">Key Responsibilities</h2>
                                <ul className="space-y-4 mb-8">
                                    {job.responsibilities.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <div className="mt-1.5 w-5 h-5 rounded-full bg-[#D3E9FD] flex items-center justify-center flex-shrink-0"><span className="w-2 h-2 rounded-full bg-[#05033e]"></span></div>
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
                                            <div className="mt-1.5 w-5 h-5 rounded-full bg-[#D3E9FD] flex items-center justify-center flex-shrink-0"><span className="w-2 h-2 rounded-full bg-[#05033e]"></span></div>
                                            <span className="text-gray-600 text-lg leading-relaxed">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}

                        <div className="mt-8 border-t border-gray-100 pt-8">
                            <h3 className="text-lg font-bold text-[#05033e] mb-3">Share Job:</h3>
                            <div className="flex gap-4">
                                <button className="p-3 bg-gray-50 rounded-full hover:bg-[#05033e] hover:text-white transition-colors text-[#05033e]"><Facebook size={20} /></button>
                                <button className="p-3 bg-gray-50 rounded-full hover:bg-[#05033e] hover:text-white transition-colors text-[#05033e]"><Linkedin size={20} /></button>
                                <button className="p-3 bg-gray-50 rounded-full hover:bg-[#05033e] hover:text-white transition-colors text-[#05033e]"><Share2 size={20} /></button>
                            </div>
                        </div>
                    </div>

                    {/* Related Jobs */}
                    <div>
                        <h2 className="text-3xl font-bold text-[#05033e] mb-8">Related Jobs</h2>
                        <div className="space-y-4">
                            {relatedJobs.length > 0 ? (
                                relatedJobs.map(j => (
                                    <Link key={j._id} href={`/browse-jobs/${j._id}`}>
                                        <div className="bg-white p-6 rounded-xl hover:shadow-md transition-shadow border border-gray-100">
                                            <h3 className="text-lg font-bold text-[#05033e] mb-1">{j.title}</h3>
                                            <p className="text-gray-600">{j.company} • {j.location}</p>
                                        </div>
                                    </Link>
                                ))
                            ) : <p className="text-gray-500">No related jobs found.</p>}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-[#D3E9FD] p-8 rounded-3xl">
                        <h3 className="text-xl font-bold text-[#05033e] mb-6">Job Overview</h3>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4"><User className="text-[#05033e] mt-1" size={24} /><div><h4 className="font-bold text-[#05033e]">Job Title</h4><p className="text-gray-600">{job.title}</p></div></div>
                            <div className="flex items-start gap-4"><Clock className="text-[#05033e] mt-1" size={24} /><div><h4 className="font-bold text-[#05033e]">Job Type</h4><p className="text-gray-600">{job.type}</p></div></div>
                            <div className="flex items-start gap-4"><BriefcaseBusiness className="text-[#05033e] mt-1" size={24} /><div><h4 className="font-bold text-[#05033e]">Category</h4><p className="text-gray-600">{job.category}</p></div></div>
                            <div className="flex items-start gap-4"><Globe className="text-[#05033e] mt-1" size={24} /><div><h4 className="font-bold text-[#05033e]">Experience</h4><p className="text-gray-600">{job.experienceLevel || job.experience || "Not specified"}</p></div></div>
                            <div className="flex items-start gap-4"><Wallet className="text-[#05033e] mt-1" size={24} /><div><h4 className="font-bold text-[#05033e]">Offered Salary</h4><p className="text-gray-600">{formatSalary(job.salary)}</p></div></div>
                            <div className="flex items-start gap-4"><MapPin className="text-[#05033e] mt-1" size={24} /><div><h4 className="font-bold text-[#05033e]">Location</h4><p className="text-gray-600">{job.location}</p></div></div>
                            <div className="flex items-start gap-4"><Calendar className="text-[#05033e] mt-1" size={24} /><div><h4 className="font-bold text-[#05033e]">Posted</h4><p className="text-gray-600">{formatDate(job.createdAt || job.postedDate)}</p></div></div>
                        </div>
                    </div>

                    {/* Message Form */}
                    <div className="bg-[#D3E9FD] p-8 rounded-3xl">
                        <h3 className="text-xl font-bold text-[#05033e] mb-6">Send Us Message</h3>
                        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); window.location.href = `mailto:shivamsingh21062005@gmail.com?subject=${encodeURIComponent(`Job Inquiry: ${job.title}`)}&body=${encodeURIComponent(`Name: ${fd.get('name')}\nEmail: ${fd.get('email')}\nPhone: ${fd.get('phone')}\n\n${fd.get('message')}`)}`; }}>
                            <div className="relative"><User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input name="name" type="text" placeholder="Full name" required className="w-full pl-12 pr-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-[#05033e]/20 bg-white" /></div>
                            <div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input name="email" type="email" placeholder="Email Address" required className="w-full pl-12 pr-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-[#05033e]/20 bg-white" /></div>
                            <div className="relative"><Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input name="phone" type="tel" placeholder="Phone Number" className="w-full pl-12 pr-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-[#05033e]/20 bg-white" /></div>
                            <div className="relative"><MessageSquare className="absolute left-4 top-4 text-gray-400" size={18} /><textarea name="message" placeholder="Your Message" rows={4} required className="w-full pl-12 pr-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-[#05033e]/20 resize-none bg-white"></textarea></div>
                            <button type="submit" className="w-full bg-[#05033e] text-white font-bold py-3 rounded-xl hover:bg-[#020120] transition-colors shadow-lg">Send Message</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
