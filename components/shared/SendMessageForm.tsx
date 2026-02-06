'use client';

import { useState } from 'react';
import { User, Mail, Phone, MessageSquare, Loader2, CheckCircle, XCircle } from 'lucide-react';

interface SendMessageFormProps {
    jobTitle?: string;
    jobId?: string;
    variant?: 'default' | 'compact';
    className?: string;
}

interface FormData {
    name: string;
    email: string;
    phone: string;
    message: string;
}

export default function SendMessageForm({
    jobTitle,
    jobId,
    variant = 'default',
    className = ''
}: SendMessageFormProps) {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const resetForm = () => {
        setFormData({ name: '', email: '', phone: '', message: '' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
            setStatus('error');
            setErrorMessage('Please fill in all required fields.');
            setTimeout(() => setStatus('idle'), 5000);
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setStatus('error');
            setErrorMessage('Please enter a valid email address.');
            setTimeout(() => setStatus('idle'), 5000);
            return;
        }

        setStatus('loading');
        setErrorMessage('');

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: formData.name,
                    email: formData.email,
                    phone: formData.phone || undefined,
                    message: formData.message,
                    ...(jobTitle && { jobTitle }),
                    ...(jobId && { jobId })
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setStatus('success');
                resetForm();
                setTimeout(() => setStatus('idle'), 5000);
            } else {
                setStatus('error');
                setErrorMessage(data.error || 'Failed to send message. Please try again.');
                setTimeout(() => setStatus('idle'), 5000);
            }
        } catch {
            setStatus('error');
            setErrorMessage('Network error. Please check your connection and try again.');
            setTimeout(() => setStatus('idle'), 5000);
        }
    };

    const inputBaseClass = variant === 'compact'
        ? 'w-full pl-10 pr-3 py-2.5 rounded-lg text-sm'
        : 'w-full pl-12 pr-4 py-3 rounded-xl';

    const iconSize = variant === 'compact' ? 16 : 18;
    const iconClass = variant === 'compact' ? 'absolute left-3 top-1/2 -translate-y-1/2' : 'absolute left-4 top-1/2 -translate-y-1/2';

    return (
        <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
            {/* Name Input */}
            <div className="relative">
                <User className={`${iconClass} text-gray-400`} size={iconSize} />
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Full name *"
                    required
                    disabled={status === 'loading'}
                    className={`${inputBaseClass} border-none focus:ring-2 focus:ring-[#05033e]/20 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed`}
                />
            </div>

            {/* Email Input */}
            <div className="relative">
                <Mail className={`${iconClass} text-gray-400`} size={iconSize} />
                <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Email address *"
                    required
                    disabled={status === 'loading'}
                    className={`${inputBaseClass} border-none focus:ring-2 focus:ring-[#05033e]/20 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed`}
                />
            </div>

            {/* Phone Input */}
            <div className="relative">
                <Phone className={`${iconClass} text-gray-400`} size={iconSize} />
                <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Phone number (optional)"
                    disabled={status === 'loading'}
                    className={`${inputBaseClass} border-none focus:ring-2 focus:ring-[#05033e]/20 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed`}
                />
            </div>

            {/* Message Input */}
            <div className="relative">
                <MessageSquare
                    className={`absolute ${variant === 'compact' ? 'left-3 top-3' : 'left-4 top-4'} text-gray-400`}
                    size={iconSize}
                />
                <textarea
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="Your message *"
                    rows={variant === 'compact' ? 3 : 4}
                    required
                    disabled={status === 'loading'}
                    className={`${inputBaseClass} border-none focus:ring-2 focus:ring-[#05033e]/20 resize-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed`}
                />
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={status === 'loading'}
                className={`w-full bg-[#05033e] text-white font-bold ${variant === 'compact' ? 'py-2.5 text-sm' : 'py-3'} rounded-xl hover:bg-[#020120] transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
            >
                {status === 'loading' ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending...
                    </>
                ) : 'Send Message'}
            </button>

            {/* Status Messages */}
            {status === 'success' && (
                <div className="flex items-center justify-center gap-2 text-green-600 text-sm font-semibold animate-fade-in">
                    <CheckCircle size={18} />
                    <span>Message sent successfully! We'll get back to you soon.</span>
                </div>
            )}

            {status === 'error' && (
                <div className="flex items-center justify-center gap-2 text-red-600 text-sm font-semibold animate-fade-in">
                    <XCircle size={18} />
                    <span>{errorMessage}</span>
                </div>
            )}
        </form>
    );
}
