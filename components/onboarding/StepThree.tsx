"use client";

import { useState, useRef } from "react";
import { Upload, FileText, X, User, Loader2 } from "lucide-react";
import Image from "next/image";

interface StepThreeProps {
    data: {
        resume: { url: string; filename: string } | null;
        profileImage: string;
    };
    onChange: (data: StepThreeProps["data"]) => void;
}

export default function StepThree({ data, onChange }: StepThreeProps) {
    const [formData, setFormData] = useState(data);
    const [uploadingResume, setUploadingResume] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const resumeInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    const uploadFile = async (file: File, type: "resume" | "avatar") => {
        const formDataUpload = new FormData();
        formDataUpload.append("file", file);
        formDataUpload.append("type", type);

        const response = await fetch("/api/upload", {
            method: "POST",
            body: formDataUpload,
        });

        const result = await response.json();
        if (!result.success) {
            throw new Error(result.error);
        }

        return result.data;
    };

    const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
        if (!allowedTypes.includes(file.type)) {
            alert("Please upload a PDF or Word document");
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            alert("File size must be less than 5MB");
            return;
        }

        setUploadingResume(true);
        try {
            const result = await uploadFile(file, "resume");
            const newData = {
                ...formData,
                resume: { url: result.url, filename: result.filename },
            };
            setFormData(newData);
            onChange(newData);
        } catch (error) {
            console.error("Upload error:", error);
            alert("Failed to upload resume");
        } finally {
            setUploadingResume(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            alert("Please upload an image file");
            return;
        }

        // Validate file size (2MB max)
        if (file.size > 2 * 1024 * 1024) {
            alert("Image size must be less than 2MB");
            return;
        }

        setUploadingImage(true);
        try {
            const result = await uploadFile(file, "avatar");
            const newData = { ...formData, profileImage: result.url };
            setFormData(newData);
            onChange(newData);
        } catch (error) {
            console.error("Upload error:", error);
            alert("Failed to upload image");
        } finally {
            setUploadingImage(false);
        }
    };

    const removeResume = () => {
        const newData = { ...formData, resume: null };
        setFormData(newData);
        onChange(newData);
    };

    const removeImage = () => {
        const newData = { ...formData, profileImage: "" };
        setFormData(newData);
        onChange(newData);
    };

    return (
        <div className="space-y-8">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile & Documents</h2>
                <p className="text-gray-600">Upload your resume and profile picture</p>
            </div>

            {/* Profile Image */}
            <div className="flex flex-col items-center">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                    Profile Picture
                </label>
                <div className="relative">
                    {formData.profileImage ? (
                        <div className="relative">
                            <Image
                                src={formData.profileImage}
                                alt="Profile"
                                width={128}
                                height={128}
                                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                            />
                            <button
                                type="button"
                                onClick={removeImage}
                                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ) : (
                        <div
                            onClick={() => imageInputRef.current?.click()}
                            className="w-32 h-32 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#05033e] hover:bg-gray-50 transition-all"
                        >
                            {uploadingImage ? (
                                <Loader2 size={32} className="text-gray-400 animate-spin" />
                            ) : (
                                <>
                                    <User size={32} className="text-gray-400 mb-1" />
                                    <span className="text-xs text-gray-500">Upload</span>
                                </>
                            )}
                        </div>
                    )}
                </div>
                <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                />
                <p className="text-xs text-gray-500 mt-2">JPG, PNG, WebP (max 2MB)</p>
            </div>

            {/* Resume Upload */}
            <div className="p-6 bg-gray-50 rounded-xl">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                    Resume / CV
                </label>

                {formData.resume ? (
                    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <FileText size={24} className="text-blue-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">{formData.resume.filename}</p>
                                <p className="text-sm text-gray-500">Uploaded successfully</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={removeResume}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                ) : (
                    <div
                        onClick={() => resumeInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-[#05033e] hover:bg-white transition-all"
                    >
                        {uploadingResume ? (
                            <div className="flex flex-col items-center">
                                <Loader2 size={48} className="text-[#05033e] animate-spin mb-4" />
                                <p className="text-gray-600">Uploading...</p>
                            </div>
                        ) : (
                            <>
                                <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                                <p className="text-gray-900 font-medium mb-1">
                                    Click to upload your resume
                                </p>
                                <p className="text-sm text-gray-500">
                                    PDF, DOC, DOCX (max 5MB)
                                </p>
                            </>
                        )}
                    </div>
                )}

                <input
                    ref={resumeInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeUpload}
                    className="hidden"
                />
            </div>

            {/* Tips */}
            <div className="p-4 bg-blue-50 rounded-xl">
                <h4 className="font-medium text-blue-900 mb-2">Tips for a great profile:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Use a professional headshot for your profile picture</li>
                    <li>• Keep your resume up to date with latest experience</li>
                    <li>• PDF format is preferred for resumes</li>
                    <li>• You can update these anytime from your profile</li>
                </ul>
            </div>
        </div>
    );
}
