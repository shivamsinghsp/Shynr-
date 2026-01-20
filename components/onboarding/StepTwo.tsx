"use client";

import { useState } from "react";
import { Plus, X, GraduationCap, Briefcase } from "lucide-react";

interface Education {
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
    current: boolean;
}

interface Experience {
    company: string;
    title: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
}

interface StepTwoProps {
    data: {
        headline: string;
        summary: string;
        skills: string[];
        education: Education[];
        experience: Experience[];
    };
    onChange: (data: StepTwoProps["data"]) => void;
}

const emptyEducation: Education = {
    institution: "",
    degree: "",
    fieldOfStudy: "",
    startDate: "",
    endDate: "",
    current: false,
};

const emptyExperience: Experience = {
    company: "",
    title: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
};

export default function StepTwo({ data, onChange }: StepTwoProps) {
    const [formData, setFormData] = useState(data);
    const [newSkill, setNewSkill] = useState("");

    const updateData = (newData: typeof formData) => {
        setFormData(newData);
        onChange(newData);
    };

    const addSkill = () => {
        if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
            updateData({ ...formData, skills: [...formData.skills, newSkill.trim()] });
            setNewSkill("");
        }
    };

    const removeSkill = (skill: string) => {
        updateData({ ...formData, skills: formData.skills.filter((s) => s !== skill) });
    };

    const addEducation = () => {
        updateData({ ...formData, education: [...formData.education, { ...emptyEducation }] });
    };

    const updateEducation = (index: number, field: keyof Education, value: string | boolean) => {
        const newEducation = [...formData.education];
        newEducation[index] = { ...newEducation[index], [field]: value };
        updateData({ ...formData, education: newEducation });
    };

    const removeEducation = (index: number) => {
        updateData({ ...formData, education: formData.education.filter((_, i) => i !== index) });
    };

    const addExperience = () => {
        updateData({ ...formData, experience: [...formData.experience, { ...emptyExperience }] });
    };

    const updateExperience = (index: number, field: keyof Experience, value: string | boolean) => {
        const newExperience = [...formData.experience];
        newExperience[index] = { ...newExperience[index], [field]: value };
        updateData({ ...formData, experience: newExperience });
    };

    const removeExperience = (index: number) => {
        updateData({ ...formData, experience: formData.experience.filter((_, i) => i !== index) });
    };

    return (
        <div className="space-y-8">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Professional Details</h2>
                <p className="text-gray-600">Share your education and experience</p>
            </div>

            {/* Headline */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Professional Headline
                </label>
                <input
                    type="text"
                    value={formData.headline}
                    onChange={(e) => updateData({ ...formData, headline: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#05033e] focus:border-transparent transition-all"
                    placeholder="e.g., Senior Software Engineer at Google"
                />
            </div>

            {/* Summary */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Professional Summary
                </label>
                <textarea
                    value={formData.summary}
                    onChange={(e) => updateData({ ...formData, summary: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#05033e] focus:border-transparent transition-all resize-none"
                    placeholder="Brief description about yourself and your career goals..."
                />
            </div>

            {/* Skills */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                <div className="flex gap-2 mb-3">
                    <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#05033e] focus:border-transparent transition-all"
                        placeholder="Add a skill..."
                    />
                    <button
                        type="button"
                        onClick={addSkill}
                        className="px-4 py-3 bg-[#05033e] text-white rounded-xl hover:bg-[#020120] transition-colors"
                    >
                        <Plus size={20} />
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill) => (
                        <span
                            key={skill}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2"
                        >
                            {skill}
                            <button onClick={() => removeSkill(skill)} className="hover:text-red-600">
                                <X size={14} />
                            </button>
                        </span>
                    ))}
                </div>
            </div>

            {/* Education */}
            <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <GraduationCap size={20} className="text-[#05033e]" />
                        <h3 className="font-medium text-gray-900">Education</h3>
                    </div>
                    <button
                        type="button"
                        onClick={addEducation}
                        className="text-sm text-[#05033e] hover:underline flex items-center gap-1"
                    >
                        <Plus size={16} /> Add Education
                    </button>
                </div>
                <div className="space-y-4">
                    {formData.education.map((edu, index) => (
                        <div key={index} className="p-4 bg-white rounded-xl border border-gray-200 relative">
                            <button
                                type="button"
                                onClick={() => removeEducation(index)}
                                className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                            >
                                <X size={18} />
                            </button>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    value={edu.institution}
                                    onChange={(e) => updateEducation(index, "institution", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    placeholder="Institution Name"
                                />
                                <input
                                    type="text"
                                    value={edu.degree}
                                    onChange={(e) => updateEducation(index, "degree", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    placeholder="Degree (e.g., Bachelor's)"
                                />
                                <input
                                    type="text"
                                    value={edu.fieldOfStudy}
                                    onChange={(e) => updateEducation(index, "fieldOfStudy", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    placeholder="Field of Study"
                                />
                                <div className="flex gap-2">
                                    <input
                                        type="month"
                                        value={edu.startDate}
                                        onChange={(e) => updateEducation(index, "startDate", e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    />
                                    <input
                                        type="month"
                                        value={edu.endDate}
                                        onChange={(e) => updateEducation(index, "endDate", e.target.value)}
                                        disabled={edu.current}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50"
                                    />
                                </div>
                            </div>
                            <label className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                                <input
                                    type="checkbox"
                                    checked={edu.current}
                                    onChange={(e) => updateEducation(index, "current", e.target.checked)}
                                    className="rounded"
                                />
                                Currently studying here
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Experience */}
            <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Briefcase size={20} className="text-[#05033e]" />
                        <h3 className="font-medium text-gray-900">Experience</h3>
                    </div>
                    <button
                        type="button"
                        onClick={addExperience}
                        className="text-sm text-[#05033e] hover:underline flex items-center gap-1"
                    >
                        <Plus size={16} /> Add Experience
                    </button>
                </div>
                <div className="space-y-4">
                    {formData.experience.map((exp, index) => (
                        <div key={index} className="p-4 bg-white rounded-xl border border-gray-200 relative">
                            <button
                                type="button"
                                onClick={() => removeExperience(index)}
                                className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                            >
                                <X size={18} />
                            </button>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    value={exp.company}
                                    onChange={(e) => updateExperience(index, "company", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    placeholder="Company Name"
                                />
                                <input
                                    type="text"
                                    value={exp.title}
                                    onChange={(e) => updateExperience(index, "title", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    placeholder="Job Title"
                                />
                                <input
                                    type="text"
                                    value={exp.location}
                                    onChange={(e) => updateExperience(index, "location", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    placeholder="Location"
                                />
                                <div className="flex gap-2">
                                    <input
                                        type="month"
                                        value={exp.startDate}
                                        onChange={(e) => updateExperience(index, "startDate", e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    />
                                    <input
                                        type="month"
                                        value={exp.endDate}
                                        onChange={(e) => updateExperience(index, "endDate", e.target.value)}
                                        disabled={exp.current}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50"
                                    />
                                </div>
                            </div>
                            <label className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                                <input
                                    type="checkbox"
                                    checked={exp.current}
                                    onChange={(e) => updateExperience(index, "current", e.target.checked)}
                                    className="rounded"
                                />
                                Currently working here
                            </label>
                            <textarea
                                value={exp.description}
                                onChange={(e) => updateExperience(index, "description", e.target.value)}
                                rows={2}
                                className="w-full mt-3 px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                                placeholder="Job description..."
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
