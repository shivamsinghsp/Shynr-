"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Upload, CheckCircle, Loader2, FileText, X, Plus, Trash2, GraduationCap } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef, useMemo } from "react";
import { useSession } from "next-auth/react";

interface Job {
    _id: string;
    title: string;
    company: string;
    location: string;
}

interface Education {
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
    current: boolean;
}

export default function ApplyPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const id = params.id as string;

    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        linkedin: "",
        portfolio: "",
        coverLetter: "",
    });

    const [educationList, setEducationList] = useState<Education[]>([]);
    const [resume, setResume] = useState<{ url: string; filename: string } | null>(null);
    const [uploadingResume, setUploadingResume] = useState(false);
    const resumeInputRef = useRef<HTMLInputElement>(null);

    // Skills state
    const [skills, setSkills] = useState<string[]>([]);
    const [skillInput, setSkillInput] = useState("");
    const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);

    // Common skill suggestions
    const skillSuggestions = [
        "JavaScript", "TypeScript", "React", "Next.js", "Node.js",
        "Python", "Java", "C++", "C#", "PHP",
        "HTML", "CSS", "Tailwind CSS", "Bootstrap", "SASS",
        "MongoDB", "PostgreSQL", "MySQL", "Redis", "Firebase",
        "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes",
        "Git", "GitHub", "GitLab", "CI/CD", "DevOps",
        "REST API", "GraphQL", "Microservices", "System Design",
        "Machine Learning", "Data Analysis", "Excel", "Power BI", "Tableau",
        "Communication", "Leadership", "Problem Solving", "Team Work", "Time Management",
        "Project Management", "Agile", "Scrum", "JIRA", "Confluence"
    ];

    const filteredSuggestions = skillSuggestions.filter(
        skill => skill.toLowerCase().includes(skillInput.toLowerCase()) && !skills.includes(skill)
    ).slice(0, 6);

    const addSkill = (skill: string) => {
        if (skills.length < 5 && skill.trim() && !skills.includes(skill.trim())) {
            setSkills([...skills, skill.trim()]);
            setSkillInput("");
            setShowSkillSuggestions(false);
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setSkills(skills.filter(s => s !== skillToRemove));
    };

    // Form validation - check if all required fields are filled
    const isFormValid = useMemo(() => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return (
            formData.firstName.trim() !== "" &&
            formData.lastName.trim() !== "" &&
            formData.email.trim() !== "" &&
            emailRegex.test(formData.email) &&
            formData.phone.trim() !== "" &&
            resume !== null
        );
    }, [formData.firstName, formData.lastName, formData.email, formData.phone, resume]);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;

            try {
                setLoading(true);

                // Fetch Job
                const jobRes = await fetch(`/api/jobs/${id}`);
                const jobData = await jobRes.json();

                if (jobData.success) {
                    setJob(jobData.data);
                } else {
                    setError("Job not found");
                    return;
                }

                // Fetch User Profile
                const profileRes = await fetch('/api/users/profile');
                const profileData = await profileRes.json();

                if (profileData.success && profileData.data) {
                    const user = profileData.data;
                    setFormData(prev => ({
                        ...prev,
                        firstName: user.firstName || "",
                        lastName: user.lastName || "",
                        email: user.email || "",
                        phone: user.phone || "",
                        address: user.address?.street || "",
                        city: user.address?.city || "",
                        state: user.address?.state || "",
                        zip: user.address?.zipCode || "",
                        linkedin: user.linkedin || "",
                        portfolio: user.portfolio || "",
                    }));

                    if (user.resume && user.resume.url) {
                        setResume({
                            url: user.resume.url,
                            filename: user.resume.filename || "Resume.pdf"
                        });
                    }

                    if (user.education && user.education.length > 0) {
                        setEducationList(user.education.map((edu: any) => ({
                            institution: edu.institution,
                            degree: edu.degree,
                            fieldOfStudy: edu.fieldOfStudy,
                            startDate: edu.startDate ? new Date(edu.startDate).toISOString().split('T')[0] : '',
                            endDate: edu.endDate ? new Date(edu.endDate).toISOString().split('T')[0] : '',
                            current: edu.current || false
                        })));
                    }
                }

                // Check if already applied
                const appsRes = await fetch('/api/applications');
                const appsData = await appsRes.json();
                if (appsData.success) {
                    const alreadyApplied = appsData.data.some((app: any) => app.job._id === id);
                    if (alreadyApplied) {
                        setHasApplied(true);
                    }
                }

            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to load data");
            } finally {
                setLoading(false);
            }
        };

        if (session?.user) {
            fetchData();
        } else if (session === null) {
            fetchData();
        }
    }, [id, session]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEducationChange = (index: number, field: keyof Education, value: any) => {
        const updatedList = [...educationList];
        updatedList[index] = { ...updatedList[index], [field]: value };
        setEducationList(updatedList);
    };

    const addEducation = () => {
        setEducationList([...educationList, {
            institution: "",
            degree: "",
            fieldOfStudy: "",
            startDate: "",
            endDate: "",
            current: false
        }]);
    };

    const removeEducation = (index: number) => {
        setEducationList(educationList.filter((_, i) => i !== index));
    };

    const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
        if (!allowedTypes.includes(file.type)) {
            alert("Please upload a PDF or Word document");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert("File size must be less than 5MB");
            return;
        }

        setUploadingResume(true);
        try {
            const formDataUpload = new FormData();
            formDataUpload.append("file", file);
            formDataUpload.append("type", "resume");

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formDataUpload,
            });

            const result = await response.json();
            if (result.success) {
                setResume({
                    url: result.data.url,
                    filename: result.data.filename
                });
            } else {
                alert(result.error || "Failed to upload resume");
            }
        } catch (error) {
            console.error("Upload error:", error);
            alert("Failed to upload resume");
        } finally {
            setUploadingResume(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!resume) {
            alert("Please upload a resume to apply.");
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch("/api/applications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jobId: id,
                    coverLetter: formData.coverLetter,
                    resume: resume,
                    answers: [],
                    education: educationList // Pass education data
                })
            });

            const result = await response.json();

            if (result.success) {
                setIsSubmitted(true);
                setTimeout(() => {
                    router.push("/jobs");
                }, 3000);
            } else {
                alert(result.error || "Failed to submit application");
            }
        } catch (err) {
            console.error("Submit error:", err);
            alert("Failed to submit application");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f4f7f7] flex items-center justify-center p-6">
                <Loader2 className="animate-spin text-[#05033e]" size={40} />
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="min-h-screen bg-[#f4f7f7] flex items-center justify-center p-6">
                <div className="bg-white p-8 rounded-xl shadow-sm text-center">
                    <p className="text-red-500 text-lg mb-4">{error || "Job not found"}</p>
                    <Link href="/jobs" className="text-[#05033e] font-medium hover:underline">
                        Return to Jobs
                    </Link>
                </div>
            </div>
        );
    }

    if (hasApplied) {
        return (
            <div className="min-h-screen bg-[#f4f7f7] flex items-center justify-center p-6">
                <div className="bg-white p-12 rounded-3xl shadow-xl text-center max-w-lg w-full">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="text-blue-600" size={40} />
                    </div>
                    <h2 className="text-3xl font-bold text-[#05033e] mb-2">Already Applied!</h2>
                    <p className="text-gray-600 mb-8">
                        You have already submitted an application for <strong>{job.title}</strong> at {job.company}.
                    </p>
                    <Link href="/jobs" className="inline-block px-8 py-3 bg-[#05033e] text-white rounded-xl font-medium hover:bg-[#020120] transition-colors">
                        Browse More Jobs
                    </Link>
                </div>
            </div>
        );
    }

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-[#f4f7f7] flex items-center justify-center p-6">
                <div className="bg-white p-12 rounded-3xl shadow-xl text-center max-w-lg w-full">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="text-green-600" size={40} />
                    </div>
                    <h2 className="text-3xl font-bold text-[#05033e] mb-2">Application Sent!</h2>
                    <p className="text-gray-600 mb-8">
                        Thank you for applying to <strong>{job.title}</strong> at {job.company}. We will be in touch soon.
                    </p>
                    <p className="text-sm text-gray-400">Redirecting to jobs...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f4f7f7] py-12 px-4 md:px-8">
            <div className="max-w-4xl mx-auto">
                <Link href={`/jobs/${id}`} className="inline-flex items-center gap-2 text-gray-500 hover:text-[#05033e] mb-8 transition-colors">
                    <ArrowLeft size={20} />
                    <span className="font-medium">Back to Job Details</span>
                </Link>

                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="bg-[#05033e] text-white p-8 md:p-12">
                        <span className="bg-white/10 px-4 py-1.5 rounded-full text-sm font-medium mb-4 inline-block">
                            Application Form
                        </span>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">Apply for {job.title}</h1>
                        <p className="text-gray-300 text-lg">{job.company} • {job.location}</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-12">

                        {/* Section: Personal Info */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-[#05033e] border-b border-gray-100 pb-2">Personal Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">First Name <span className="text-red-500">*</span></label>
                                    <input required type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#05033e]/20 focus:border-[#05033e]" placeholder="Jane" />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">Last Name <span className="text-red-500">*</span></label>
                                    <input required type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#05033e]/20 focus:border-[#05033e]" placeholder="Doe" />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">Email Address <span className="text-red-500">*</span></label>
                                    <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#05033e]/20 focus:border-[#05033e]" placeholder="jane@example.com" />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">Phone Number <span className="text-red-500">*</span></label>
                                    <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#05033e]/20 focus:border-[#05033e]" placeholder="+1 (555) 000-0000" />
                                </div>
                            </div>
                        </div>

                        {/* Section: Address */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-[#05033e] border-b border-gray-100 pb-2">Address</h2>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">Street Address</label>
                                    <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#05033e]/20 focus:border-[#05033e]" placeholder="123 Main St" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">City</label>
                                        <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#05033e]/20 focus:border-[#05033e]" placeholder="City" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">State/Province</label>
                                        <input type="text" name="state" value={formData.state} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#05033e]/20 focus:border-[#05033e]" placeholder="State" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">Postal Code</label>
                                        <input type="text" name="zip" value={formData.zip} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#05033e]/20 focus:border-[#05033e]" placeholder="Zip" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section: Education */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                <h2 className="text-xl font-bold text-[#05033e]">Education</h2>
                                <button type="button" onClick={addEducation} className="text-sm text-[#05033e] hover:underline font-medium flex items-center gap-1">
                                    <Plus size={16} /> Add Education
                                </button>
                            </div>

                            {educationList.length === 0 ? (
                                <p className="text-gray-500 italic">No education details added. Click "Add Education" to list your qualifications.</p>
                            ) : (
                                <div className="space-y-8">
                                    {educationList.map((edu, index) => (
                                        <div key={index} className="bg-gray-50 p-6 rounded-xl relative group">
                                            <button
                                                type="button"
                                                onClick={() => removeEducation(index)}
                                                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="block text-sm font-semibold text-gray-700">Institution</label>
                                                    <input
                                                        type="text"
                                                        value={edu.institution}
                                                        onChange={(e) => handleEducationChange(index, "institution", e.target.value)}
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#05033e]/20 focus:border-[#05033e]"
                                                        placeholder="University name"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="block text-sm font-semibold text-gray-700">Degree</label>
                                                    <input
                                                        type="text"
                                                        value={edu.degree}
                                                        onChange={(e) => handleEducationChange(index, "degree", e.target.value)}
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#05033e]/20 focus:border-[#05033e]"
                                                        placeholder="e.g. Bachelor's"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="block text-sm font-semibold text-gray-700">Field of Study</label>
                                                    <input
                                                        type="text"
                                                        value={edu.fieldOfStudy}
                                                        onChange={(e) => handleEducationChange(index, "fieldOfStudy", e.target.value)}
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#05033e]/20 focus:border-[#05033e]"
                                                        placeholder="e.g. Computer Science"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="block text-sm font-semibold text-gray-700">Start Date</label>
                                                        <input
                                                            type="date"
                                                            value={edu.startDate}
                                                            onChange={(e) => handleEducationChange(index, "startDate", e.target.value)}
                                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#05033e]/20 focus:border-[#05033e]"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="block text-sm font-semibold text-gray-700">End Date</label>
                                                        <input
                                                            type="date"
                                                            value={edu.endDate}
                                                            onChange={(e) => handleEducationChange(index, "endDate", e.target.value)}
                                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#05033e]/20 focus:border-[#05033e]"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Section: Skills */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                <h2 className="text-xl font-bold text-[#05033e]">Skills</h2>
                                <span className="text-sm text-gray-500">{skills.length}/5 skills</span>
                            </div>

                            {/* Added Skills */}
                            {skills.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {skills.map((skill, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#05033e] text-white rounded-full text-sm font-medium"
                                        >
                                            {skill}
                                            <button
                                                type="button"
                                                onClick={() => removeSkill(skill)}
                                                className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Skill Input */}
                            {skills.length < 5 && (
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={skillInput}
                                        onChange={(e) => {
                                            setSkillInput(e.target.value);
                                            setShowSkillSuggestions(e.target.value.length > 0);
                                        }}
                                        onFocus={() => setShowSkillSuggestions(skillInput.length > 0)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                if (skillInput.trim()) addSkill(skillInput);
                                            }
                                        }}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#05033e]/20 focus:border-[#05033e]"
                                        placeholder="Type a skill and press Enter (e.g. React, Python, Excel)"
                                    />

                                    {/* Suggestions Dropdown */}
                                    {showSkillSuggestions && filteredSuggestions.length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                                            {filteredSuggestions.map((suggestion, index) => (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    onClick={() => addSkill(suggestion)}
                                                    className="w-full px-4 py-2.5 text-left hover:bg-[#D3E9FD] transition-colors first:rounded-t-xl last:rounded-b-xl"
                                                >
                                                    {suggestion}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {skills.length === 0 && (
                                <p className="text-gray-500 italic text-sm">Add up to 5 skills to highlight your expertise.</p>
                            )}
                        </div>

                        {/* Section: Professional Links */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-[#05033e] border-b border-gray-100 pb-2">Professional Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">LinkedIn Profile</label>
                                    <input type="url" name="linkedin" value={formData.linkedin} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#05033e]/20 focus:border-[#05033e]" placeholder="linkedin.com/in/..." />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">Portfolio URL</label>
                                    <input type="url" name="portfolio" value={formData.portfolio} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#05033e]/20 focus:border-[#05033e]" placeholder="yourwebsite.com" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Resume/CV <span className="text-red-500">*</span></label>

                                {resume ? (
                                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-200 rounded-lg">
                                                <FileText size={24} className="text-[#05033e]" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-[#05033e]">{resume.filename}</p>
                                                <a href={resume.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">View File</a>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setResume(null)}
                                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => resumeInputRef.current?.click()}
                                        className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer group"
                                    >
                                        <div className="bg-[#D3E9FD] p-3 rounded-full mb-3 group-hover:scale-110 transition-transform">
                                            {uploadingResume ? (
                                                <Loader2 className="animate-spin text-[#05033e]" size={24} />
                                            ) : (
                                                <Upload className="text-[#05033e]" size={24} />
                                            )}
                                        </div>
                                        <p className="text-[#05033e] font-medium">
                                            {uploadingResume ? "Uploading..." : "Click to upload or drag and drop"}
                                        </p>
                                        <p className="text-gray-400 text-sm mt-1">PDF, DOC, DOCX (Max 5MB)</p>
                                    </div>
                                )}
                                <input
                                    ref={resumeInputRef}
                                    type="file"
                                    name="resume"
                                    accept=".pdf,.doc,.docx"
                                    className="hidden"
                                    onChange={handleResumeUpload}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Cover Letter <span className="text-gray-400 font-normal">(Optional)</span></label>
                                <textarea name="coverLetter" value={formData.coverLetter} onChange={handleInputChange} rows={5} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#05033e]/20 focus:border-[#05033e] resize-none" placeholder="Tell us why you're a great fit for this role..."></textarea>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="pt-4">
                            {!isFormValid && (
                                <p className="text-sm text-amber-600 mb-3 text-center">
                                    Please fill in all required fields (First Name, Last Name, Email, Phone) and upload your resume to submit.
                                </p>
                            )}
                            <button
                                type="submit"
                                disabled={submitting || uploadingResume || !isFormValid}
                                className="w-full bg-[#05033e] text-white font-bold py-4 rounded-xl text-lg hover:bg-[#020120] transition-all shadow-xl hover:shadow-2xl active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        Submitting...
                                    </>
                                ) : "Submit Application"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
