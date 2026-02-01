import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL;

    if (!baseUrl && process.env.NODE_ENV === 'production') {
        console.error('CRITICAL: NEXT_PUBLIC_APP_URL not set for robots.txt generation');
    }

    const safeBaseUrl = baseUrl || 'http://localhost:3000';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/admin/',
                '/api/',
                '/dashboard/',
                '/applications/',
                '/attendance/',
                '/profile/',
                '/(protected)/',
            ],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
