import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/db';
import Application from '@/db/models/Application';
import { canAccessAdminPanel } from '@/lib/permissions';

// GET /api/admin/applications/export - Export applications to CSV
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const userRole = (session?.user as any)?.role;

        if (!session?.user || !canAccessAdminPanel(userRole)) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await dbConnect();

        // Get query params for filtering
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const ids = searchParams.get('ids'); // Comma-separated IDs for selected export

        // Build query
        const query: any = {};
        if (status && status !== 'all') {
            query.status = status;
        }
        if (ids) {
            query._id = { $in: ids.split(',') };
        }

        const applications = await Application.find(query)
            .populate('job', 'title company location type')
            .populate('user', 'firstName lastName email phone')
            .sort({ appliedAt: -1 })
            .lean();

        // Build CSV content
        const csvHeaders = [
            'Application ID',
            'Applicant Name',
            'Email',
            'Phone',
            'Job Title',
            'Company',
            'Location',
            'Job Type',
            'Status',
            'Applied Date',
            'Cover Letter',
        ];

        const csvRows = applications.map((app: any) => {
            const user = app.user || {};
            const job = app.job || {};

            return [
                app._id.toString(),
                `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A',
                user.email || 'N/A',
                user.phone || 'N/A',
                job.title || 'N/A',
                job.company || 'N/A',
                job.location || 'N/A',
                job.type || 'N/A',
                app.status || 'N/A',
                app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('en-GB') : 'N/A',
                (app.coverLetter || '').replace(/[\n\r,]/g, ' ').substring(0, 200),
            ];
        });

        // Create CSV string
        const csvContent = [
            csvHeaders.join(','),
            ...csvRows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        // Return CSV file
        return new NextResponse(csvContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="applications-${new Date().toISOString().split('T')[0]}.csv"`,
            },
        });
    } catch (error) {
        console.error('Error exporting applications:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to export applications' },
            { status: 500 }
        );
    }
}
