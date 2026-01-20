'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const JOB_CATEGORIES = [
    'Technology', 'Healthcare', 'Finance', 'Marketing', 'Sales',
    'Human Resources', 'Engineering', 'Design', 'Customer Service',
    'Operations', 'Legal', 'Education', 'Manufacturing', 'Retail', 'Other'
];

const JOB_TYPES = ['Full Time', 'Part Time', 'Contract', 'Internship', 'Remote'];
const EXPERIENCE_LEVELS = ['Entry', 'Mid', 'Senior', 'Lead', 'Executive'];
const LOCATION_TYPES = ['onsite', 'remote', 'hybrid'];

export default function CreateJobPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        company: '',
        location: '',
        locationType: 'onsite',
        category: '',
        type: 'Full Time',
        experienceLevel: 'Mid',
        salary: {
            min: 0,
            max: 0,
            currency: 'USD',
            period: 'yearly'
        },
        description: '',
        shortDescription: '',
        responsibilities: '',
        requirements: '',
        benefits: '',
        skills: '',
        requiredExperience: '',
        requiredDegree: '',
        applicationDeadline: '',
        status: 'draft',
        featured: false,
        urgent: false
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (name.startsWith('salary.')) {
            const salaryField = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                salary: {
                    ...prev.salary,
                    [salaryField]: salaryField === 'min' || salaryField === 'max' ? parseInt(value) || 0 : value
                }
            }));
        } else if (type === 'checkbox') {
            setFormData(prev => ({
                ...prev,
                [name]: (e.target as HTMLInputElement).checked
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Convert comma-separated strings to arrays
            const jobData = {
                ...formData,
                responsibilities: formData.responsibilities.split('\n').filter(r => r.trim()),
                requirements: formData.requirements.split('\n').filter(r => r.trim()),
                benefits: formData.benefits.split('\n').filter(b => b.trim()),
                skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
                applicationDeadline: formData.applicationDeadline ? new Date(formData.applicationDeadline) : undefined
            };

            const res = await fetch('/api/admin/jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(jobData)
            });

            const data = await res.json();

            if (data.success) {
                router.push('/admin/jobs');
            } else {
                setError(data.error || 'Failed to create job');
            }
        } catch (err) {
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/admin/jobs" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Create New Job</h1>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#05033e] focus:border-transparent"
                                placeholder="e.g., Senior Software Engineer"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                            <input
                                type="text"
                                name="company"
                                value={formData.company}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#05033e] focus:border-transparent"
                                placeholder="e.g., Shynr Inc."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#05033e] focus:border-transparent"
                            >
                                <option value="">Select category</option>
                                {JOB_CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Location & Type */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Location & Type</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#05033e] focus:border-transparent"
                                placeholder="e.g., New York, NY"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Location Type</label>
                            <select
                                name="locationType"
                                value={formData.locationType}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#05033e] focus:border-transparent"
                            >
                                {LOCATION_TYPES.map(lt => (
                                    <option key={lt} value={lt}>{lt.charAt(0).toUpperCase() + lt.slice(1)}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#05033e] focus:border-transparent"
                            >
                                {JOB_TYPES.map(jt => (
                                    <option key={jt} value={jt}>{jt}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                            <select
                                name="experienceLevel"
                                value={formData.experienceLevel}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#05033e] focus:border-transparent"
                            >
                                {EXPERIENCE_LEVELS.map(el => (
                                    <option key={el} value={el}>{el}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Application Deadline</label>
                            <input
                                type="date"
                                name="applicationDeadline"
                                value={formData.applicationDeadline}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#05033e] focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Salary */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Salary Information</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Min Salary *</label>
                            <input
                                type="number"
                                name="salary.min"
                                value={formData.salary.min}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#05033e] focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Max Salary *</label>
                            <input
                                type="number"
                                name="salary.max"
                                value={formData.salary.max}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#05033e] focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                            <select
                                name="salary.currency"
                                value={formData.salary.currency}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#05033e] focus:border-transparent"
                            >
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                                <option value="GBP">GBP</option>
                                <option value="INR">INR</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
                            <select
                                name="salary.period"
                                value={formData.salary.period}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#05033e] focus:border-transparent"
                            >
                                <option value="hourly">Hourly</option>
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Description</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                            <input
                                type="text"
                                name="shortDescription"
                                value={formData.shortDescription}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#05033e] focus:border-transparent"
                                placeholder="Brief summary for job cards"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Description *</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                rows={5}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#05033e] focus:border-transparent"
                                placeholder="Detailed job description..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Responsibilities (one per line)</label>
                            <textarea
                                name="responsibilities"
                                value={formData.responsibilities}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#05033e] focus:border-transparent"
                                placeholder="Lead development projects&#10;Mentor junior developers&#10;Code reviews"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Requirements (one per line)</label>
                            <textarea
                                name="requirements"
                                value={formData.requirements}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#05033e] focus:border-transparent"
                                placeholder="5+ years experience&#10;Bachelor's degree in CS&#10;Strong communication skills"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Benefits (one per line)</label>
                            <textarea
                                name="benefits"
                                value={formData.benefits}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#05033e] focus:border-transparent"
                                placeholder="Health insurance&#10;401k matching&#10;Remote work options"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma separated)</label>
                            <input
                                type="text"
                                name="skills"
                                value={formData.skills}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#05033e] focus:border-transparent"
                                placeholder="React, Node.js, TypeScript, AWS"
                            />
                        </div>
                    </div>
                </div>

                {/* Options */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Posting Options</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#05033e] focus:border-transparent"
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-4 pt-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="featured"
                                    checked={formData.featured}
                                    onChange={handleChange}
                                    className="w-4 h-4 rounded border-gray-300 text-[#05033e] focus:ring-[#05033e]"
                                />
                                <span className="text-sm text-gray-700">Featured</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="urgent"
                                    checked={formData.urgent}
                                    onChange={handleChange}
                                    className="w-4 h-4 rounded border-gray-300 text-[#05033e] focus:ring-[#05033e]"
                                />
                                <span className="text-sm text-gray-700">Urgent</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-[#05033e] text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-900 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Create Job'}
                    </button>
                    <Link
                        href="/admin/jobs"
                        className="flex-1 text-center bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
