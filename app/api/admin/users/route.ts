import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/db';
import User from '@/db/models/User';

// GET /api/admin/users - Get all users for admin
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || (session.user as any).role !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await dbConnect();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status') || '';
        const role = searchParams.get('role') || '';

        // Build query - show all users (user, employee) but allow viewing admins too
        const query: any = {};

        // Role filter
        if (role) {
            query.role = role;
        } else {
            // By default show all non-admin users (users and employees)
            query.$or = [{ role: 'user' }, { role: 'employee' }, { role: { $exists: false } }, { role: null }];
        }

        if (search) {
            query.$and = query.$and || [];
            query.$and.push({
                $or: [
                    { firstName: { $regex: search, $options: 'i' } },
                    { lastName: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                ]
            });
        }

        if (status === 'active') {
            query.$and = query.$and || [];
            query.$and.push({ isActive: { $ne: false } }); // Default to active if not set
        } else if (status === 'inactive') {
            query.isActive = false;
        }

        const [users, total] = await Promise.all([
            User.find(query)
                .select('firstName lastName email phone profileImage isActive emailVerified onboardingCompleted profileCompleteness createdAt lastLoginAt role')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            User.countDocuments(query)
        ]);

        return NextResponse.json({
            success: true,
            data: users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching users for admin:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}
