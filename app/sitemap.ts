import { MetadataRoute } from 'next';
import dbConnect from '@/db';
import Job from '@/db/models/Job';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';

    // Static routes
    const routes = [
        '',
        '/about',
        '/about/leadership',
        '/about/partners',
        '/browse-jobs',
        '/careers',
        '/contactUs',
        '/services',
        '/services/staffing-solutions',
        '/services/consulting',
        '/services/technology',
        '/auth/signin',
        '/auth/signup',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
    }));

    // Fetch dynamic routes (Jobs)
    let jobRoutes: MetadataRoute.Sitemap = [];
    try {
        await dbConnect();
        // Fetch only published jobs and select necessary fields
        const jobs = await Job.find({ status: 'published' })
            .select('_id updatedAt postedDate')
            .lean();

        jobRoutes = jobs.map((job) => ({
            url: `${baseUrl}/browse-jobs/${job._id}`,
            lastModified: job.updatedAt ? new Date(job.updatedAt) : new Date(job.postedDate),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }));
    } catch (error) {
        console.error('Error generating sitemap for jobs:', error);
    }

    return [...routes, ...jobRoutes];
}
