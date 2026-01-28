import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/db';
import Attendance from '@/db/models/Attendance';
import AttendanceLocation, { calculateDistance } from '@/db/models/AttendanceLocation';

// POST /api/attendance/mark - Mark check-in or check-out
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Check if user is an employee
        const userRole = (session.user as any).role;
        if (userRole !== 'employee' && userRole !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'Only employees can mark attendance' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { latitude, longitude, action } = body;

        if (!latitude || !longitude) {
            return NextResponse.json(
                { success: false, error: 'Location coordinates are required' },
                { status: 400 }
            );
        }

        // Time Validation
        const now = new Date();
        const currentHour = now.getHours();

        if (action === 'check-in') {
            // Allow only between 10:00 AM and 11:00 AM
            if (currentHour < 10 || currentHour >= 11) {
                return NextResponse.json(
                    { success: false, error: 'Check-in is only allowed between 10:00 AM and 11:00 AM.' },
                    { status: 400 }
                );
            }
        } else if (action === 'check-out') {
            // Allow only after 7:00 PM (19:00)
            if (currentHour < 19) {
                return NextResponse.json(
                    { success: false, error: 'Check-out is only allowed after 07:00 PM.' },
                    { status: 400 }
                );
            }
        }

        await dbConnect();

        // Find nearby valid location
        const locations = await AttendanceLocation.find({ isActive: true });

        let nearestLocation = null;
        let nearestDistance = Infinity;

        for (const location of locations) {
            const distance = calculateDistance(latitude, longitude, location.latitude, location.longitude);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestLocation = location;
            }
        }

        if (!nearestLocation || nearestDistance > nearestLocation.radius) {
            return NextResponse.json({
                success: false,
                error: 'You are not within any allowed attendance location',
                nearestLocation: nearestLocation ? {
                    name: nearestLocation.name,
                    distance: Math.round(nearestDistance),
                    requiredRadius: nearestLocation.radius,
                } : null,
            }, { status: 400 });
        }

        const userId = (session.user as any).id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if already has attendance for today
        const existingAttendance = await Attendance.findOne({
            user: userId,
            date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
        });

        if (action === 'check-in') {
            if (existingAttendance) {
                return NextResponse.json({
                    success: false,
                    error: 'You have already checked in today',
                    attendance: existingAttendance,
                }, { status: 400 });
            }

            // Create new attendance record
            const attendance = await Attendance.create({
                user: userId,
                date: today,
                checkIn: new Date(),
                checkInLocation: {
                    latitude,
                    longitude,
                    locationId: nearestLocation._id,
                    locationName: nearestLocation.name,
                    distance: Math.round(nearestDistance),
                },
                status: 'checked-in',
            });

            return NextResponse.json({
                success: true,
                message: 'Checked in successfully',
                attendance,
                location: nearestLocation.name,
                distance: Math.round(nearestDistance),
            });
        } else if (action === 'check-out') {
            if (!existingAttendance) {
                return NextResponse.json({
                    success: false,
                    error: 'You have not checked in today',
                }, { status: 400 });
            }

            if (existingAttendance.status === 'checked-out') {
                return NextResponse.json({
                    success: false,
                    error: 'You have already checked out today',
                }, { status: 400 });
            }

            existingAttendance.checkOut = new Date();
            existingAttendance.checkOutLocation = {
                latitude,
                longitude,
                locationId: nearestLocation._id,
                locationName: nearestLocation.name,
                distance: Math.round(nearestDistance),
            };
            existingAttendance.status = 'checked-out';
            await existingAttendance.save();

            return NextResponse.json({
                success: true,
                message: 'Checked out successfully',
                attendance: existingAttendance,
                workHours: existingAttendance.workHours,
            });
        }

        return NextResponse.json(
            { success: false, error: 'Invalid action. Use "check-in" or "check-out"' },
            { status: 400 }
        );
    } catch (error: any) {
        console.error('Error marking attendance:', error);

        // Handle duplicate key error (already checked in today)
        if (error.code === 11000) {
            return NextResponse.json(
                { success: false, error: 'You have already checked in today. Refresh the page to see your status.' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, error: error.message || 'Failed to mark attendance' },
            { status: 500 }
        );
    }
}
