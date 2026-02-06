import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/db';
import AttendanceLocation from '@/db/models/AttendanceLocation';
import { canAccessAdminPanel } from '@/lib/permissions';

// GET /api/admin/locations - Get all locations
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

        const locations = await AttendanceLocation.find().sort({ createdAt: -1 }).lean();

        return NextResponse.json({
            success: true,
            data: locations,
        });
    } catch (error) {
        console.error('Error fetching locations:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch locations' },
            { status: 500 }
        );
    }
}

// POST /api/admin/locations - Create new location
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const userRole = (session?.user as any)?.role;

        if (!session?.user || !canAccessAdminPanel(userRole)) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { name, address, latitude, longitude, radius } = body;

        if (!name || !address || latitude === undefined || longitude === undefined) {
            return NextResponse.json(
                { success: false, error: 'Name, address, latitude, and longitude are required' },
                { status: 400 }
            );
        }

        await dbConnect();

        const location = await AttendanceLocation.create({
            name,
            address,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            radius: radius || 100,
            isActive: true,
        });

        return NextResponse.json({
            success: true,
            message: 'Location created successfully',
            data: location,
        });
    } catch (error) {
        console.error('Error creating location:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create location' },
            { status: 500 }
        );
    }
}
