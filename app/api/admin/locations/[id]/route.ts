import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/db';
import AttendanceLocation from '@/db/models/AttendanceLocation';
import { canAccessAdminPanel } from '@/lib/permissions';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// PUT /api/admin/locations/[id] - Update location
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || !canAccessAdminPanel((session.user as any).role)) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await dbConnect();

        const { id } = await params;
        const body = await request.json();

        const location = await AttendanceLocation.findByIdAndUpdate(
            id,
            {
                ...body,
                latitude: body.latitude ? parseFloat(body.latitude) : undefined,
                longitude: body.longitude ? parseFloat(body.longitude) : undefined,
            },
            { new: true }
        );

        if (!location) {
            return NextResponse.json(
                { success: false, error: 'Location not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Location updated successfully',
            data: location,
        });
    } catch (error) {
        console.error('Error updating location:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update location' },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/locations/[id] - Delete location
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || !canAccessAdminPanel((session.user as any).role)) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await dbConnect();

        const { id } = await params;

        const location = await AttendanceLocation.findByIdAndDelete(id);

        if (!location) {
            return NextResponse.json(
                { success: false, error: 'Location not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Location deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting location:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete location' },
            { status: 500 }
        );
    }
}
