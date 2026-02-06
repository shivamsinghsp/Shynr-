"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, X, SlidersHorizontal, ChevronDown, Briefcase, DollarSign, Tag } from "lucide-react";

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

// Desktop Filter Panel Component
export function DesktopFilterPanel({ filters, setFilters }: JobFiltersProps) {
    const activeFiltersCount = filters.categories.length + filters.jobTypes.length +
        (filters.location ? 1 : 0) + (filters.salaryRange[0] > 0 ? 1 : 0);

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

    const clearAllFilters = () => {
        setFilters({
            search: "",
            location: "",
            categories: [],
            jobTypes: [],
            salaryRange: [0, 200000],
            tags: []
        });
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#05033e] to-[#1a1a6e] p-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                            <SlidersHorizontal className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-lg">Filters</h3>
                            {activeFiltersCount > 0 && (
                                <p className="text-white/70 text-sm">{activeFiltersCount} active</p>
                            )}
                        </div>
                    </div>
                    {activeFiltersCount > 0 && (
                        <button
                            onClick={clearAllFilters}
                            className="text-white/80 hover:text-white text-sm font-medium transition-colors flex items-center gap-1"
                        >
                            <X size={14} />
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Filter Content */}
            <div className="p-5 max-h-[calc(100vh-200px)] overflow-y-auto no-scrollbar">
                {/* Search */}
                <div className="mb-6">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                        <Search className="w-4 h-4" />
                        Search
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Job title or company..."
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-[#05033e] focus:outline-none text-sm transition-colors bg-gray-50/50 placeholder:text-gray-400"
                        />
                    </div>
                </div>

                {/* Location */}
                <div className="mb-6">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                        <MapPin className="w-4 h-4" />
                        Location
                    </label>
                    <div className="relative">
                        <select
                            value={filters.location}
                            onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-[#05033e] focus:outline-none text-sm appearance-none bg-gray-50/50 cursor-pointer transition-colors"
                        >
                            <option value="">All Locations</option>
                            <option value="San Francisco, CA">San Francisco, CA</option>
                            <option value="New York, NY">New York, NY</option>
                            <option value="Seattle, WA">Seattle, WA</option>
                            <option value="London, UK">London, UK</option>
                            <option value="Remote">Remote</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                    </div>
                </div>

                {/* Category */}
                <div className="mb-6">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                        <Briefcase className="w-4 h-4" />
                        Category
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {["Design", "Development", "Marketing", "Management", "Finance", "Customer Service"].map((cat) => (
                            <button
                                key={cat}
                                onClick={() => handleCategoryChange(cat)}
                                className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${filters.categories.includes(cat)
                                    ? 'bg-[#05033e] text-white shadow-md shadow-[#05033e]/20'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Job Type */}
                <div className="mb-6">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                        <Tag className="w-4 h-4" />
                        Job Type
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {["Full Time", "Part Time", "Contract", "Remote", "Freelance"].map((type) => (
                            <button
                                key={type}
                                onClick={() => handleJobTypeChange(type)}
                                className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all ${filters.jobTypes.includes(type)
                                    ? 'bg-[#05033e] text-white shadow-md shadow-[#05033e]/20'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Salary Range */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                        <DollarSign className="w-4 h-4" />
                        Minimum Salary
                    </label>
                    <div className="px-1">
                        <input
                            type="range"
                            min="0"
                            max="200000"
                            step="1000"
                            value={filters.salaryRange[0]}
                            onChange={(e) => setFilters(prev => ({ ...prev, salaryRange: [Number(e.target.value), prev.salaryRange[1]] }))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#05033e]"
                        />
                        <div className="flex justify-between mt-3">
                            <span className="text-sm font-semibold text-[#05033e] bg-[#05033e]/10 px-3 py-1 rounded-full">
                                {filters.salaryRange[0].toLocaleString()}
                            </span>
                            <span className="text-sm text-gray-500">200k+</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Mobile Filter Components
export function MobileFilterButton({ filters, onClick }: { filters: FilterState; onClick: () => void }) {
    const activeFiltersCount = filters.categories.length + filters.jobTypes.length +
        (filters.location ? 1 : 0) + (filters.salaryRange[0] > 0 ? 1 : 0) +
        (filters.search ? 1 : 0);

    return (
        <button
            onClick={onClick}
            className="lg:hidden fixed bottom-6 right-6 z-50 bg-gradient-to-r from-[#05033e] to-[#1a1a6e] text-white px-5 py-4 rounded-2xl shadow-2xl shadow-[#05033e]/40 flex items-center gap-3 hover:shadow-[#05033e]/60 transition-all active:scale-95"
        >
            <SlidersHorizontal className="w-5 h-5" />
            <span className="font-semibold">Filters</span>
            {activeFiltersCount > 0 && (
                <span className="bg-white text-[#05033e] text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                    {activeFiltersCount}
                </span>
            )}
        </button>
    );
}

export function MobileFilterDrawer({
    isOpen,
    onClose,
    filters,
    setFilters
}: {
    isOpen: boolean;
    onClose: () => void;
    filters: FilterState;
    setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}) {
    // Prevent body scroll when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

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

    const clearAllFilters = () => {
        setFilters({
            search: "",
            location: "",
            categories: [],
            jobTypes: [],
            salaryRange: [0, 200000],
            tags: []
        });
    };

    const activeFiltersCount = filters.categories.length + filters.jobTypes.length +
        (filters.location ? 1 : 0) + (filters.salaryRange[0] > 0 ? 1 : 0);

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className={`fixed inset-y-0 right-0 w-full max-w-md bg-white z-[70] transform transition-transform duration-300 ease-out shadow-2xl ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-[#05033e] to-[#1a1a6e] p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                            <SlidersHorizontal className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-lg">Filters</h3>
                            {activeFiltersCount > 0 && (
                                <p className="text-white/70 text-sm">{activeFiltersCount} active</p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>

                {/* Filter Content */}
                <div className="p-5 h-[calc(100vh-180px)] overflow-y-auto no-scrollbar">
                    {/* Search */}
                    <div className="mb-6">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                            <Search className="w-4 h-4" />
                            Search
                        </label>
                        <input
                            type="text"
                            placeholder="Job title or company..."
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-100 focus:border-[#05033e] focus:outline-none text-base transition-colors bg-gray-50/50"
                        />
                    </div>

                    {/* Location */}
                    <div className="mb-6">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                            <MapPin className="w-4 h-4" />
                            Location
                        </label>
                        <div className="relative">
                            <select
                                value={filters.location}
                                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                                className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-100 focus:border-[#05033e] focus:outline-none text-base appearance-none bg-gray-50/50 cursor-pointer"
                            >
                                <option value="">All Locations</option>
                                <option value="San Francisco, CA">San Francisco, CA</option>
                                <option value="New York, NY">New York, NY</option>
                                <option value="Seattle, WA">Seattle, WA</option>
                                <option value="London, UK">London, UK</option>
                                <option value="Remote">Remote</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                        </div>
                    </div>

                    {/* Category */}
                    <div className="mb-6">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                            <Briefcase className="w-4 h-4" />
                            Category
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {["Design", "Development", "Marketing", "Management", "Finance", "Customer Service"].map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => handleCategoryChange(cat)}
                                    className={`px-3 py-3 rounded-xl text-sm font-medium transition-all ${filters.categories.includes(cat)
                                        ? 'bg-[#05033e] text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Job Type */}
                    <div className="mb-6">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                            <Tag className="w-4 h-4" />
                            Job Type
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {["Full Time", "Part Time", "Contract", "Remote", "Freelance"].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => handleJobTypeChange(type)}
                                    className={`px-4 py-3 rounded-full text-sm font-medium transition-all ${filters.jobTypes.includes(type)
                                        ? 'bg-[#05033e] text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Salary Range */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                            <DollarSign className="w-4 h-4" />
                            Minimum Salary
                        </label>
                        <div className="px-1">
                            <input
                                type="range"
                                min="0"
                                max="200000"
                                step="1000"
                                value={filters.salaryRange[0]}
                                onChange={(e) => setFilters(prev => ({ ...prev, salaryRange: [Number(e.target.value), prev.salaryRange[1]] }))}
                                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#05033e]"
                            />
                            <div className="flex justify-between mt-3">
                                <span className="text-base font-bold text-[#05033e] bg-[#05033e]/10 px-4 py-2 rounded-full">
                                    {filters.salaryRange[0].toLocaleString()}
                                </span>
                                <span className="text-sm text-gray-500 py-2">200k+</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-5 bg-white border-t border-gray-100 flex gap-3">
                    <button
                        onClick={clearAllFilters}
                        className="flex-1 py-4 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors text-base"
                    >
                        Clear All
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 rounded-xl bg-gradient-to-r from-[#05033e] to-[#1a1a6e] text-white font-semibold hover:opacity-90 transition-all shadow-lg shadow-[#05033e]/30 text-base"
                    >
                        Show Results
                    </button>
                </div>
            </div>
        </>
    );
}

// Default export for backward compatibility (renders desktop panel only)
export default function JobFilters({ filters, setFilters }: JobFiltersProps) {
    return <DesktopFilterPanel filters={filters} setFilters={setFilters} />;
}
