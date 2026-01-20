import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/db';
import Job from '@/db/models/Job';
import Application from '@/db/models/Application';
import User from '@/db/models/User';

// GET /api/admin/stats - Get dashboard statistics
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // Check if user is admin
        if (!session?.user || (session.user as any).role !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await dbConnect();

        // Get counts
        const [
            totalJobs,
            activeJobs,
            totalApplications,
            pendingApplications,
            totalUsers,
            recentApplications
        ] = await Promise.all([
            Job.countDocuments({}),
            Job.countDocuments({ status: 'published' }),
            Application.countDocuments({}),
            Application.countDocuments({ status: 'pending' }),
            User.countDocuments({ role: 'user' }),
            Application.find({})
                .populate('job', 'title company')
                .populate('user', 'firstName lastName email')
                .sort({ appliedAt: -1 })
                .limit(5)
                .lean()
        ]);

        // Get weekly stats for comparison
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        const [
            applicationsThisWeek,
            applicationsLastWeek,
            usersThisMonth
        ] = await Promise.all([
            Application.countDocuments({ appliedAt: { $gte: oneWeekAgo } }),
            Application.countDocuments({
                appliedAt: {
                    $gte: new Date(oneWeekAgo.getTime() - 7 * 24 * 60 * 60 * 1000),
                    $lt: oneWeekAgo
                }
            }),
            User.countDocuments({ createdAt: { $gte: oneMonthAgo }, role: 'user' })
        ]);

        // Calculate percentage changes
        const applicationChange = applicationsLastWeek > 0
            ? Math.round(((applicationsThisWeek - applicationsLastWeek) / applicationsLastWeek) * 100)
            : applicationsThisWeek > 0 ? 100 : 0;

        // Get jobs closing soon (within 7 days)
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

        const jobsClosingSoon = await Job.countDocuments({
            status: 'published',
            applicationDeadline: { $lte: sevenDaysFromNow, $gte: new Date() }
        });

        return NextResponse.json({
            success: true,
            data: {
                totalJobs,
                activeJobs,
                totalApplications,
                pendingApplications,
                totalUsers,
                applicationChange,
                usersThisMonth,
                jobsClosingSoon,
                recentApplications: recentApplications.map(app => ({
                    _id: app._id,
                    job: app.job,
                    user: app.user,
                    status: app.status,
                    appliedAt: app.appliedAt
                }))
            }
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch statistics' },
            { status: 500 }
        );
    }
}
