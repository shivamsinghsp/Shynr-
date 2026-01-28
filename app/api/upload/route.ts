import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// POST /api/upload - Upload file to Cloudinary
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const type = formData.get('type') as string; // 'resume' | 'avatar'

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes: Record<string, string[]> = {
            resume: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
            avatar: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
            companyLogo: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        };

        const fileType = type || 'resume';

        if (!allowedTypes[fileType]?.includes(file.type)) {
            return NextResponse.json(
                { success: false, error: `Invalid file type for ${fileType}` },
                { status: 400 }
            );
        }

        // Convert file to base64 for Cloudinary upload
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString('base64');
        const dataUri = `data:${file.type};base64,${base64}`;

        // Upload to Cloudinary
        const uploadOptions: Record<string, string | boolean> = {
            folder: `shynr/${fileType}s`,
            resource_type: fileType === 'resume' ? 'raw' : 'image',
            public_id: `${session.user.email.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`,
        };

        if (fileType === 'avatar') {
            uploadOptions.transformation = 'w_200,h_200,c_fill,g_face';
        } else if (fileType === 'companyLogo') {
            uploadOptions.transformation = 'w_400,h_400,c_limit';
        }

        const result = await cloudinary.uploader.upload(dataUri, uploadOptions);

        return NextResponse.json({
            success: true,
            data: {
                url: result.secure_url,
                publicId: result.public_id,
                filename: file.name,
                type: fileType,
            },
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to upload file' },
            { status: 500 }
        );
    }
}

// DELETE /api/upload - Delete file from Cloudinary
export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const publicId = searchParams.get('publicId');
        const type = searchParams.get('type') || 'resume';

        if (!publicId) {
            return NextResponse.json(
                { success: false, error: 'Public ID is required' },
                { status: 400 }
            );
        }

        await cloudinary.uploader.destroy(publicId, {
            resource_type: type === 'resume' ? 'raw' : 'image',
        });

        return NextResponse.json({
            success: true,
            message: 'File deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting file:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete file' },
            { status: 500 }
        );
    }
}
