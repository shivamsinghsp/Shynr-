"use client";

import { Search, MapPin } from "lucide-react";

export interface FilterState {
    search: string;
    location: string;
    categories: string[];
    jobTypes: string[];
    salaryRange: [number, number];
    tags: string[];
}

interface JobFiltersProps {
    filters: FilterState;
    setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

export default function JobFilters({ filters, setFilters }: JobFiltersProps) {

    const handleCategoryChange = (category: string) => {
        setFilters(prev => {
            const newCategories = prev.categories.includes(category)
                ? prev.categories.filter(c => c !== category)
                : [...prev.categories, category];
            return { ...prev, categories: newCategories };
        });
    };

    const handleJobTypeChange = (type: string) => {
        setFilters(prev => {
            const newTypes = prev.jobTypes.includes(type)
                ? prev.jobTypes.filter(t => t !== type)
                : [...prev.jobTypes, type];
            return { ...prev, jobTypes: newTypes };
        });
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 max-h-[85vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent hover:scrollbar-thumb-[#05033e]/20 transition-colors">
            {/* Search Layout */}
            <div className="mb-8">
                <h3 className="font-bold text-lg mb-4 text-[#05033e]">Search by Job Title</h3>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Job title or company"
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#05033e]/20 text-sm"
                    />
                </div>
            </div>

            {/* Location */}
            <div className="mb-8">
                <h3 className="font-bold text-lg mb-4 text-[#05033e]">Location</h3>
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <select
                        value={filters.location}
                        onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#05033e]/20 text-sm appearance-none bg-white text-gray-500"
                    >
                        <option value="">Choose city</option>
                        <option value="San Francisco, CA">San Francisco, CA</option>
                        <option value="New York, NY">New York, NY</option>
                        <option value="Seattle, WA">Seattle, WA</option>
                        <option value="London, UK">London, UK</option>
                        <option value="Remote">Remote</option>
                    </select>
                </div>
            </div>

            {/* Category */}
            <div className="mb-8">
                <h3 className="font-bold text-lg mb-4 text-[#05033e]">Category</h3>
                <div className="space-y-3">
                    {["Design", "Development", "Marketing", "Management", "Finance", "Customer Service"].map((cat) => (
                        <label key={cat} className="flex items-center justify-between cursor-pointer group">
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={filters.categories.includes(cat)}
                                    onChange={() => handleCategoryChange(cat)}
                                    className="w-4 h-4 rounded border-gray-300 text-[#05033e] focus:ring-[#05033e]"
                                />
                                <span className={`text-sm group-hover:text-[#05033e] transition-colors ${filters.categories.includes(cat) ? 'text-[#05033e] font-medium' : 'text-gray-600'}`}>{cat}</span>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Job Type */}
            <div className="mb-8">
                <h3 className="font-bold text-lg mb-4 text-[#05033e]">Job Type</h3>
                <div className="space-y-3">
                    {["Full Time", "Part Time", "Contract", "Remote", "Freelance"].map((type) => (
                        <label key={type} className="flex items-center justify-between cursor-pointer group">
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={filters.jobTypes.includes(type)}
                                    onChange={() => handleJobTypeChange(type)}
                                    className="w-4 h-4 rounded border-gray-300 text-[#05033e] focus:ring-[#05033e]"
                                />
                                <span className={`text-sm group-hover:text-[#05033e] transition-colors ${filters.jobTypes.includes(type) ? 'text-[#05033e] font-medium' : 'text-gray-600'}`}>{type}</span>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Salary Range */}
            <div className="mb-8">
                <h3 className="font-bold text-lg mb-4 text-[#05033e]">Min Salary</h3>
                <input
                    type="range"
                    min="0"
                    max="200000"
                    step="5000"
                    value={filters.salaryRange[0]}
                    onChange={(e) => setFilters(prev => ({ ...prev, salaryRange: [Number(e.target.value), prev.salaryRange[1]] }))}
                    className="w-full accent-[#05033e] h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between mt-2 text-sm text-gray-600 font-medium">
                    <span>${filters.salaryRange[0].toLocaleString()}</span>
                    <span>$200k+</span>
                </div>
            </div>
        </div>
    );
}
