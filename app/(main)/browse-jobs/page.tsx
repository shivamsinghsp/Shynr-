"use client";

import React, { useEffect, useState } from "react";
import PublicJobsComp from "./PublicJobsComp";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import JobFilters, { FilterState, MobileFilterButton, MobileFilterDrawer } from "./JobFilters";

interface Job {
    _id: string;
    title: string;
    company: string;
    companyLogo?: string;
    location: string;
    category: string;
    type: string;
    salary: { min: number; max: number; currency: string; period: string; };
    description?: string;
    shortDescription?: string;
    skills?: string[];
    featured?: boolean;
    urgent?: boolean;
}

const BrowseJobsPage = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    const [filters, setFilters] = useState<FilterState>({
        search: "", location: "", categories: [], jobTypes: [], salaryRange: [0, 200000], tags: []
    });

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/jobs');
                const data = await response.json();
                if (data.success) { setJobs(data.data); }
                else { setError(data.error || 'Failed to fetch jobs'); }
            } catch (err) {
                console.error('Error fetching jobs:', err);
                setError('Failed to load jobs');
            } finally { setLoading(false); }
        };
        fetchJobs();
    }, []);

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(filters.search.toLowerCase()) || job.company.toLowerCase().includes(filters.search.toLowerCase());
        const matchesLocation = filters.location ? job.location.includes(filters.location) : true;
        const matchesCategory = filters.categories.length > 0 ? filters.categories.includes(job.category) : true;
        const matchesType = filters.jobTypes.length > 0 ? filters.jobTypes.includes(job.type) : true;
        const salaryMin = job.salary?.min || 0;
        const matchesSalary = salaryMin >= filters.salaryRange[0];
        return matchesSearch && matchesLocation && matchesCategory && matchesType && matchesSalary;
    });

    const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
    useEffect(() => { setCurrentPage(1); }, [filters]);

    const startResult = filteredJobs.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
    const endResult = Math.min(currentPage * itemsPerPage, filteredJobs.length);
    const displayedJobs = filteredJobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div id="job" className="w-full bg-[#f4f7f7] min-h-screen">
            {/* Header Section */}
            <div className="w-full bg-[#05033e] text-white pt-10 pb-20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>

                <div className="px-6 md:px-12 xl:px-24 mx-auto max-w-7xl relative z-10 text-center md:text-left">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">Browse Jobs</h1>
                            <p className="text-lg md:text-xl text-gray-300 max-w-2xl leading-relaxed">
                                Explore thousands of job opportunities. No account required!
                            </p>
                        </div>
                        <Link href="/auth/signin" className="bg-white text-[#05033e] px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                            Sign in for more features
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="w-full max-w-[98%] mx-auto px-4 md:px-6 mt-8 pb-24 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="hidden lg:block lg:col-span-3 xl:col-span-3">
                        <div className="sticky top-6 max-h-[calc(100vh-3rem)]">
                            <JobFilters filters={filters} setFilters={setFilters} />
                        </div>
                    </div>

                    <div className="lg:col-span-9 xl:col-span-9">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <span className="text-gray-600 font-medium text-lg">
                                Showing <span className="text-[#05033e] font-bold">{startResult}-{endResult}</span> of {filteredJobs.length} results
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-500 text-sm">Sort by:</span>
                                <select className="bg-transparent font-semibold text-[#05033e] focus:outline-none cursor-pointer">
                                    <option>Newest</option>
                                    <option>Salary: High to Low</option>
                                    <option>Salary: Low to High</option>
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse"></div>)}</div>
                        ) : (
                            <>
                                {displayedJobs.length > 0 ? (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                        {displayedJobs.map((job) => <PublicJobsComp key={job._id} job={job} />)}
                                    </div>
                                ) : (
                                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                                        <p className="text-gray-500 text-lg">No jobs found matching your filters.</p>
                                        <button onClick={() => setFilters({ search: "", location: "", categories: [], jobTypes: [], salaryRange: [0, 200000], tags: [] })} className="mt-4 text-[#05033e] font-medium hover:underline">Clear all filters</button>
                                    </div>
                                )}

                                {totalPages > 1 && (
                                    <div className="flex justify-center mt-12 gap-2">
                                        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-[#05033e] disabled:opacity-50">&lt;</button>
                                        {Array.from({ length: totalPages }).map((_, i) => (
                                            <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-10 h-10 rounded-lg font-medium transition-all ${currentPage === i + 1 ? "bg-[#05033e] text-white shadow-lg shadow-[#05033e]/30" : "bg-white border border-gray-200 text-gray-600 hover:border-[#05033e] hover:text-[#05033e]"}`}>{i + 1}</button>
                                        ))}
                                        <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-[#05033e] disabled:opacity-50">&gt;</button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Filter Button */}
            <MobileFilterButton
                filters={filters}
                onClick={() => setIsMobileFilterOpen(true)}
            />

            {/* Mobile Filter Drawer */}
            <MobileFilterDrawer
                isOpen={isMobileFilterOpen}
                onClose={() => setIsMobileFilterOpen(false)}
                filters={filters}
                setFilters={setFilters}
            />
        </div>
    );
};

export default BrowseJobsPage;
