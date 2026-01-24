"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Mail, CheckCircle, RefreshCw, AlertTriangle } from "lucide-react";

type Step = 'email' | 'otp' | 'success';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [resendCooldown, setResendCooldown] = useState(0);
    const [devOtp, setDevOtp] = useState<string | null>(null);

    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Resend cooldown timer
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        setDevOtp(null);

        try {
            const response = await fetch("/api/otp/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, type: "password_reset" }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Something went wrong");
            }

            // Check if in dev mode (SMTP not configured)
            if (data.devMode && data.devOtp) {
                setDevOtp(data.devOtp);
            }

            setStep('otp');
            setResendCooldown(60); // 60 seconds cooldown
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) {
            // Handle paste
            const pastedValue = value.slice(0, 6);
            const newOtp = [...otp];
            for (let i = 0; i < pastedValue.length && index + i < 6; i++) {
                if (/^\d$/.test(pastedValue[i])) {
                    newOtp[index + i] = pastedValue[i];
                }
            }
            setOtp(newOtp);
            // Focus last filled input or next empty
            const lastIndex = Math.min(index + pastedValue.length - 1, 5);
            otpRefs.current[lastIndex]?.focus();
            return;
        }

        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const otpValue = otp.join("");
        if (otpValue.length !== 6) {
            setError("Please enter the complete 6-digit OTP");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/otp/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp: otpValue, type: "password_reset" }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Invalid OTP");
            }

            // Store email in session storage for reset password page
            sessionStorage.setItem('resetPasswordEmail', email);

            // Redirect to reset password page
            router.push('/auth/reset-password?verified=true');
        } catch (err) {
            setError(err instanceof Error ? err.message : "Invalid OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (resendCooldown > 0) return;

        setError("");
        setLoading(true);
        setDevOtp(null);

        try {
            const response = await fetch("/api/otp/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, type: "password_reset" }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to resend OTP");
            }

            // Check if in dev mode
            if (data.devMode && data.devOtp) {
                setDevOtp(data.devOtp);
            }

            setOtp(["", "", "", "", "", ""]);
            setResendCooldown(60);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to resend OTP");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Form */}
            <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 xl:px-24 bg-white">
                <div className="max-w-md w-full mx-auto">
                    {/* Logo */}
                    <Link href="/" className="inline-block mb-8">
                        <Image src="/3.png" alt="SHYNR" width={150} height={50} className="object-contain" />
                    </Link>

                    {step === 'email' && (
                        <div>
                            <Link
                                href="/auth/signin"
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
                            >
                                <ArrowLeft size={18} /> Back to Sign In
                            </Link>

                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
                            <p className="text-gray-600 mb-8">
                                Enter your email address and we&apos;ll send you an OTP to reset your password.
                            </p>

                            <form onSubmit={handleEmailSubmit} className="space-y-6">
                                {error && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                                        {error}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#05033e] focus:border-transparent transition-all"
                                            placeholder="you@example.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-[#05033e] text-white rounded-xl font-semibold hover:bg-[#020120] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        "Send OTP"
                                    )}
                                </button>
                            </form>
                        </div>
                    )}

                    {step === 'otp' && (
                        <div>
                            <button
                                onClick={() => setStep('email')}
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
                            >
                                <ArrowLeft size={18} /> Change Email
                            </button>

                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Enter OTP</h1>
                            <p className="text-gray-600 mb-2">
                                We&apos;ve sent a 6-digit code to
                            </p>
                            <p className="text-[#05033e] font-semibold mb-6">{email}</p>

                            {/* Dev Mode OTP Display */}
                            {devOtp && (
                                <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 mb-6">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-amber-800 font-semibold text-sm">Development Mode</p>
                                            <p className="text-amber-700 text-sm mt-1">SMTP not configured. Your OTP is:</p>
                                            <p className="text-amber-900 font-mono font-bold text-2xl mt-2 tracking-widest">{devOtp}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleOtpSubmit} className="space-y-6">
                                {error && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                                        {error}
                                    </div>
                                )}

                                {/* OTP Input Boxes */}
                                <div className="flex justify-between gap-2">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={(el) => { otpRefs.current[index] = el; }}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={6}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                            className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#05033e] focus:border-[#05033e] transition-all"
                                        />
                                    ))}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || otp.join("").length !== 6}
                                    className="w-full py-3 bg-[#05033e] text-white rounded-xl font-semibold hover:bg-[#020120] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        "Verify OTP"
                                    )}
                                </button>

                                {/* Resend OTP */}
                                <div className="text-center">
                                    <p className="text-gray-600 text-sm mb-2">Didn&apos;t receive the code?</p>
                                    <button
                                        type="button"
                                        onClick={handleResendOtp}
                                        disabled={resendCooldown > 0 || loading}
                                        className="inline-flex items-center gap-2 text-[#05033e] font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">OTP Verified!</h1>
                            <p className="text-gray-600 mb-8">
                                Redirecting you to reset your password...
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Side - Decorative */}
            <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#05033e] to-[#1a1a6e] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />

                <div className="relative z-10 flex flex-col justify-center px-16 xl:px-24 text-white">
                    <h2 className="text-4xl xl:text-5xl font-bold mb-6 leading-tight">
                        Reset Your<br />Password
                    </h2>
                    <p className="text-lg text-white/80 mb-8 max-w-md">
                        Don&apos;t worry, it happens to the best of us. Enter your email and we&apos;ll send you an OTP to reset your password securely.
                    </p>

                    {/* Security Tips */}
                    <div className="space-y-4">
                        <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-bold">1</span>
                            </div>
                            <div>
                                <p className="font-medium">Enter your email</p>
                                <p className="text-white/60 text-sm">We&apos;ll send a 6-digit OTP</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-bold">2</span>
                            </div>
                            <div>
                                <p className="font-medium">Verify OTP</p>
                                <p className="text-white/60 text-sm">Enter the code within 10 mins</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-bold">3</span>
                            </div>
                            <div>
                                <p className="font-medium">Set new password</p>
                                <p className="text-white/60 text-sm">Create a strong password</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
