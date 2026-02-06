'use client';

import { useState } from 'react';
import { Facebook, Linkedin, Share2, Check, Copy, Twitter } from 'lucide-react';

interface ShareButtonsProps {
    url?: string;
    title?: string;
    description?: string;
    showLabels?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export default function ShareButtons({
    url,
    title = 'Check this out!',
    description = '',
    showLabels = false,
    size = 'md',
    className = ''
}: ShareButtonsProps) {
    const [copied, setCopied] = useState(false);

    // Get current URL if not provided
    const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(title);
    const encodedDescription = encodeURIComponent(description);

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy link:', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = shareUrl;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch {
                alert('Failed to copy link. Please copy manually: ' + shareUrl);
            }
            document.body.removeChild(textArea);
        }
    };

    const handleShare = (platform: 'facebook' | 'linkedin' | 'twitter') => {
        let shareLink = '';

        switch (platform) {
            case 'facebook':
                shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
                break;
            case 'linkedin':
                shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
                break;
            case 'twitter':
                shareLink = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
                break;
        }

        if (shareLink) {
            window.open(shareLink, '_blank', 'width=600,height=500,scrollbars=yes');
        }
    };

    const handleNativeShare = async () => {
        if (typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share({
                    title,
                    text: description || title,
                    url: shareUrl
                });
            } catch (err) {
                // User cancelled or share failed - fallback to copy
                if ((err as Error).name !== 'AbortError') {
                    handleCopyLink();
                }
            }
        } else {
            handleCopyLink();
        }
    };

    const sizeClasses = {
        sm: 'p-2',
        md: 'p-3',
        lg: 'p-4'
    };

    const iconSizes = {
        sm: 16,
        md: 20,
        lg: 24
    };

    const buttonClass = `${sizeClasses[size]} bg-gray-50 rounded-full hover:bg-[#05033e] hover:text-white transition-all duration-300 text-[#05033e] cursor-pointer`;

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {/* Facebook */}
            <button
                onClick={() => handleShare('facebook')}
                className={buttonClass}
                aria-label="Share on Facebook"
                title="Share on Facebook"
            >
                <Facebook size={iconSizes[size]} />
            </button>

            {/* LinkedIn */}
            <button
                onClick={() => handleShare('linkedin')}
                className={buttonClass}
                aria-label="Share on LinkedIn"
                title="Share on LinkedIn"
            >
                <Linkedin size={iconSizes[size]} />
            </button>

            {/* Twitter/X */}
            <button
                onClick={() => handleShare('twitter')}
                className={buttonClass}
                aria-label="Share on Twitter"
                title="Share on Twitter"
            >
                <Twitter size={iconSizes[size]} />
            </button>

            {/* Share/Copy Link */}
            <button
                onClick={handleNativeShare}
                className={`${buttonClass} ${copied ? 'bg-green-500 text-white hover:bg-green-600' : ''}`}
                aria-label={copied ? 'Link copied!' : 'Copy link'}
                title={copied ? 'Link copied!' : 'Copy link'}
            >
                {copied ? <Check size={iconSizes[size]} /> : <Share2 size={iconSizes[size]} />}
            </button>

            {showLabels && copied && (
                <span className="text-green-600 text-sm font-medium animate-fade-in">
                    Link copied!
                </span>
            )}
        </div>
    );
}
