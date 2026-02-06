'use server';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { canAccessAdminPanel } from '@/lib/permissions';

// GET /api/admin/download-resume - Proxy download from Cloudinary
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // Check if user is authenticated
        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, error: 'Authentication required' },
                { status: 401 }
            );
        }

        const userRole = (session.user as { role?: string }).role || '';
        if (!canAccessAdminPanel(userRole)) {
            return NextResponse.json(
                { success: false, error: 'Admin access required' },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const url = searchParams.get('url');
        const filename = searchParams.get('filename') || 'resume.pdf';

        if (!url) {
            return NextResponse.json(
                { success: false, error: 'URL is required' },
                { status: 400 }
            );
        }

        // Validate that the URL is from Cloudinary
        if (!url.includes('cloudinary.com') && !url.includes('res.cloudinary.com')) {
            return NextResponse.json(
                { success: false, error: 'Invalid file URL' },
                { status: 400 }
            );
        }

        // Fetch the file from Cloudinary
        const response = await fetch(url);

        if (!response.ok) {
            return NextResponse.json(
                { success: false, error: 'Failed to fetch file' },
                { status: 502 }
            );
        }

        const contentType = response.headers.get('content-type') || 'application/pdf';
        const buffer = await response.arrayBuffer();

        // Return the file with proper headers for download
        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
                'Content-Length': buffer.byteLength.toString(),
            },
        });
    } catch (error) {
        console.error('Error downloading file:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to download file' },
            { status: 500 }
        );
    }
}
