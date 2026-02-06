import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/db';
import Settings from '@/db/models/Settings';
import { canAccessAdminPanel } from '@/lib/permissions';

// GET /api/admin/settings - Get current settings
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Allow employees and admins (including sub_admin) to read settings (for attendance validation)
        const userRole = (session.user as any).role;
        if (userRole !== 'admin' && userRole !== 'sub_admin' && userRole !== 'employee') {
            return NextResponse.json(
                { success: false, error: 'Access denied' },
                { status: 403 }
            );
        }

        await dbConnect();

        const settings = await Settings.getSettings();

        return NextResponse.json({
            success: true,
            data: {
                checkInStartHour: settings.checkInStartHour,
                checkInEndHour: settings.checkInEndHour,
                checkOutStartHour: settings.checkOutStartHour,
                updatedAt: settings.updatedAt,
            },
        });
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch settings' },
            { status: 500 }
        );
    }
}

// PUT /api/admin/settings - Update settings (Admin only)
export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userRole = (session.user as any).role;
        if (!canAccessAdminPanel(userRole)) {
            return NextResponse.json(
                { success: false, error: 'Only admins can update settings' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { checkInStartHour, checkInEndHour, checkOutStartHour } = body;

        // Validate hours
        const validateHour = (hour: number, name: string) => {
            if (typeof hour !== 'number' || hour < 0 || hour > 23) {
                throw new Error(`${name} must be between 0 and 23`);
            }
        };

        if (checkInStartHour !== undefined) validateHour(checkInStartHour, 'Check-in start hour');
        if (checkInEndHour !== undefined) validateHour(checkInEndHour, 'Check-in end hour');
        if (checkOutStartHour !== undefined) validateHour(checkOutStartHour, 'Check-out start hour');

        // Validate check-in range
        if (checkInStartHour !== undefined && checkInEndHour !== undefined) {
            if (checkInStartHour >= checkInEndHour) {
                return NextResponse.json(
                    { success: false, error: 'Check-in start must be before check-in end' },
                    { status: 400 }
                );
            }
        }

        await dbConnect();

        const settings = await Settings.getSettings();

        // Update only provided fields
        if (checkInStartHour !== undefined) settings.checkInStartHour = checkInStartHour;
        if (checkInEndHour !== undefined) settings.checkInEndHour = checkInEndHour;
        if (checkOutStartHour !== undefined) settings.checkOutStartHour = checkOutStartHour;
        settings.updatedBy = (session.user as any).id;

        await settings.save();

        return NextResponse.json({
            success: true,
            message: 'Settings updated successfully',
            data: {
                checkInStartHour: settings.checkInStartHour,
                checkInEndHour: settings.checkInEndHour,
                checkOutStartHour: settings.checkOutStartHour,
            },
        });
    } catch (error: any) {
        console.error('Error updating settings:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to update settings' },
            { status: 500 }
        );
    }
}
