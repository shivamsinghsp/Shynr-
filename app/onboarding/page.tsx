"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import StepOne from "@/components/onboarding/StepOne";
import StepTwo from "@/components/onboarding/StepTwo";
import StepThree from "@/components/onboarding/StepThree";

interface StepOneData {
    firstName: string;
    lastName: string;
    phone: string;
    location: string;
    address: {
        street: string;
        city: string;
        state: string;
        country: string;
        zipCode: string;
    };
}

interface StepTwoData {
    headline: string;
    summary: string;
    skills: string[];
    education: Array<{
        institution: string;
        degree: string;
        fieldOfStudy: string;
        startDate: string;
        endDate: string;
        current: boolean;
    }>;
    experience: Array<{
        company: string;
        title: string;
        location: string;
        startDate: string;
        endDate: string;
        current: boolean;
        description: string;
    }>;
}

interface StepThreeData {
    resume: { url: string; filename: string } | null;
    profileImage: string;
}

const initialStepOneData: StepOneData = {
    firstName: "",
    lastName: "",
    phone: "",
    location: "",
    address: {
        street: "",
        city: "",
        state: "",
        country: "",
        zipCode: "",
    },
};

const initialStepTwoData: StepTwoData = {
    headline: "",
    summary: "",
    skills: [],
    education: [],
    experience: [],
};

const initialStepThreeData: StepThreeData = {
    resume: null,
    profileImage: "",
};

function OnboardingContent() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const isEditMode = searchParams.get("mode") === "edit";

    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(isEditMode);

    const [stepOneData, setStepOneData] = useState<StepOneData>(initialStepOneData);
    const [stepTwoData, setStepTwoData] = useState<StepTwoData>(initialStepTwoData);
    const [stepThreeData, setStepThreeData] = useState<StepThreeData>(initialStepThreeData);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin");
            return;
        }

        const checkStatusAndFetch = async () => {
            if (status === "authenticated" && session?.user) {
                // If NOT in edit mode, check if already completed
                if (!isEditMode) {
                    const onboardingCompleted = (session.user as { onboardingCompleted?: boolean }).onboardingCompleted;
                    if (onboardingCompleted) {
                        router.push("/jobs");
                        return;
                    }
                }

                // If in Edit Mode OR we want to pre-fill from Google auth even in onboarding
                if (isEditMode || session.user) {
                    try {
                        setFetchingData(true);
                        const response = await fetch("/api/users/profile", { cache: "no-store" });
                        const result = await response.json();

                        if (result.success && result.data) {
                            const data = result.data;

                            // Map Step 1 Data
                            setStepOneData({
                                firstName: data.firstName || "",
                                lastName: data.lastName || "",
                                phone: data.phone || "",
                                location: data.location || "",
                                address: {
                                    street: data.address?.street || "",
                                    city: data.address?.city || "",
                                    state: data.address?.state || "",
                                    country: data.address?.country || "",
                                    zipCode: data.address?.zipCode || "",
                                }
                            });

                            // Map Step 2 Data
                            setStepTwoData({
                                headline: data.headline || "",
                                summary: data.summary || "",
                                skills: data.skills || [],
                                education: data.education?.map((edu: any) => ({
                                    ...edu,
                                    startDate: edu.startDate ? new Date(edu.startDate).toISOString().slice(0, 7) : "",
                                    endDate: edu.endDate ? new Date(edu.endDate).toISOString().slice(0, 7) : "",
                                })) || [],
                                experience: data.experience?.map((exp: any) => ({
                                    ...exp,
                                    startDate: exp.startDate ? new Date(exp.startDate).toISOString().slice(0, 7) : "",
                                    endDate: exp.endDate ? new Date(exp.endDate).toISOString().slice(0, 7) : "",
                                })) || [],
                            });

                            // Map Step 3 Data
                            setStepThreeData({
                                resume: data.resume || null,
                                profileImage: data.profileImage || "",
                            });
                        }
                    } catch (error) {
                        console.error("Error fetching profile data:", error);
                    } finally {
                        setFetchingData(false);
                    }
                }
            }
        };

        checkStatusAndFetch();
    }, [status, session, router, isEditMode]);

    const saveStepData = async (skip = false) => {
        setLoading(true);
        try {
            let data = {};
            if (!skip) {
                if (currentStep === 1) data = stepOneData;
                if (currentStep === 2) data = stepTwoData;
                if (currentStep === 3) data = stepThreeData;
            }

            const response = await fetch("/api/users/onboarding", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ step: currentStep, data, skip }),
            });

            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error);
            }

            // If updating profile (Edit Mode) or Last Step
            if (currentStep === 3 || (skip && currentStep === 3)) {
                if (isEditMode) {
                    router.push("/profile");
                } else {
                    router.push("/jobs");
                }
            } else {
                setCurrentStep(currentStep + 1);
            }
        } catch (error) {
            console.error("Error saving onboarding data:", error);
            alert("Failed to save data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading" || fetchingData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#05033e]" />
            </div>
        );
    }

    const steps = [
        { number: 1, title: "Basic Info" },
        { number: 2, title: "Professional" },
        { number: 3, title: "Documents" },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {isEditMode ? "Edit Profile" : "Complete Your Profile"}
                    </h1>
                    <p className="text-gray-600">
                        {isEditMode
                            ? "Update your information below"
                            : `Welcome ${session?.user?.name || ""}! Let's set up your profile.`
                        }
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="flex justify-center mb-12">
                    <div className="flex items-center gap-4">
                        {steps.map((step, index) => (
                            <div key={step.number} className="flex items-center">
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all ${currentStep > step.number
                                            ? "bg-green-500 text-white"
                                            : currentStep === step.number
                                                ? "bg-[#05033e] text-white"
                                                : "bg-gray-200 text-gray-500"
                                            }`}
                                    >
                                        {currentStep > step.number ? (
                                            <Check size={20} />
                                        ) : (
                                            step.number
                                        )}
                                    </div>
                                    <span className="text-xs mt-2 text-gray-600">{step.title}</span>
                                </div>
                                {index < steps.length - 1 && (
                                    <div
                                        className={`w-16 h-1 mx-2 rounded ${currentStep > step.number ? "bg-green-500" : "bg-gray-200"
                                            }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step Content */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {currentStep === 1 && (
                        <StepOne data={stepOneData} onChange={setStepOneData} />
                    )}
                    {currentStep === 2 && (
                        <StepTwo data={stepTwoData} onChange={setStepTwoData} />
                    )}
                    {currentStep === 3 && (
                        <StepThree data={stepThreeData} onChange={setStepThreeData} />
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                        {!isEditMode ? (
                            <button
                                onClick={() => saveStepData(true)}
                                disabled={loading}
                                className="px-6 py-3 text-gray-500 hover:text-gray-700 font-medium transition-colors disabled:opacity-50"
                            >
                                Skip for now
                            </button>
                        ) : (
                            <div></div> // Spacer for edit mode
                        )}

                        <div className="flex gap-3">
                            {currentStep > 1 && (
                                <button
                                    onClick={() => setCurrentStep(currentStep - 1)}
                                    disabled={loading}
                                    className="px-6 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    Back
                                </button>
                            )}
                            <button
                                onClick={() => saveStepData(false)}
                                disabled={loading}
                                className="px-8 py-3 bg-[#05033e] text-white rounded-xl font-medium hover:bg-[#020120] transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Saving...
                                    </>
                                ) : currentStep === 3 ? (
                                    isEditMode ? "Save Changes" : "Complete"
                                ) : (
                                    "Continue"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function OnboardingPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#05033e]" />
            </div>
        }>
            <OnboardingContent />
        </Suspense>
    );
}
