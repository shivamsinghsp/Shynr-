import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/db';
import User from '@/db/models/User';

// POST - Upload profile image
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const body = await request.json();
        const { image } = body;

        if (!image) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 });
        }

        // Validate that it's a base64 image
        if (!image.startsWith('data:image/')) {
            return NextResponse.json({ error: 'Invalid image format' }, { status: 400 });
        }

        // Check image size (base64 adds ~33% overhead, so 5MB file = ~6.7MB base64)
        const sizeInBytes = Buffer.from(image.split(',')[1] || '', 'base64').length;
        if (sizeInBytes > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'Image must be less than 5MB' }, { status: 400 });
        }

        // Update user's profile image
        const user = await User.findByIdAndUpdate(
            session.user.id,
            { profileImage: image },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Profile image updated successfully',
            profileImage: user.profileImage,
        });
    } catch (error: any) {
        console.error('Error uploading profile image:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to upload image' },
            { status: 500 }
        );
    }
}
