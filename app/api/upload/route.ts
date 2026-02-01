import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// File size limits in bytes
const FILE_SIZE_LIMITS: Record<string, number> = {
    resume: 5 * 1024 * 1024,      // 5MB
    avatar: 2 * 1024 * 1024,       // 2MB
    profile: 2 * 1024 * 1024,      // 2MB
    companyLogo: 1 * 1024 * 1024,  // 1MB
};

// Magic Bytes for file signature verification
const FILE_SIGNATURES: Record<string, string[]> = {
    // Images
    'image/jpeg': ['FF D8 FF'],
    'image/png': ['89 50 4E 47 0D 0A 1A 0A'],
    'image/gif': ['47 49 46 38'],
    'image/webp': ['52 49 46 46', '57 45 42 50'], // RIFF....WEBP
    // Documents
    'application/pdf': ['25 50 44 46'], // %PDF
};

// POST /api/upload - Upload file to Cloudinary (Streaming + Magic Bytes)
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, error: 'Authentication required' },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const type = formData.get('type') as string;

        if (!file) {
            return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
        }

        // 1. Initial Type Validation (Weak check)
        const allowedTypes: Record<string, string[]> = {
            resume: ['application/pdf'], // ONLY PDF for resumes in production for safety
            avatar: ['image/jpeg', 'image/png', 'image/webp'],
            profile: ['image/jpeg', 'image/png', 'image/webp'],
            companyLogo: ['image/jpeg', 'image/png', 'image/webp'],
        };

        const fileType = type || 'resume';
        if (!allowedTypes[fileType] || !allowedTypes[fileType].includes(file.type)) {
            return NextResponse.json({ success: false, error: 'Invalid file type. Only PDF allowed for resumes.' }, { status: 400 });
        }

        // 2. Size Validation
        const maxSize = FILE_SIZE_LIMITS[fileType] || FILE_SIZE_LIMITS.resume;
        if (file.size > maxSize) {
            const maxSizeMB = Math.round(maxSize / (1024 * 1024));
            return NextResponse.json({ success: false, error: `File too large. Max: ${maxSizeMB}MB` }, { status: 413 });
        }

        // 3. Magic Byte Verification (Efficient Slice)
        // Only read the first 16 bytes into memory, NOT the whole file
        const headerBuffer = await file.slice(0, 16).arrayBuffer();
        const headerBytes = Buffer.from(headerBuffer);
        const headerHex = headerBytes.toString('hex').toUpperCase();

        let isVerified = false;
        const signatures = FILE_SIGNATURES[file.type] || [];

        for (const sig of signatures) {
            const normalizedSig = sig.replace(/\s/g, '');
            if (headerHex.startsWith(normalizedSig)) {
                isVerified = true;
                break;
            }
        }

        // Special handling for WEBP
        if (file.type === 'image/webp' && !isVerified) {
            if (headerHex.startsWith('52494646') && headerHex.slice(16, 24) === '57454250') { // RIFF....WEBP
                isVerified = true;
            }
        }

        if (!isVerified && signatures.length > 0) {
            return NextResponse.json({ success: false, error: 'File verification failed (corrupt or spoofed)' }, { status: 400 });
        }

        // 4. Streaming Upload to Cloudinary
        const userIdentifier = session.user.email.replace(/[^a-zA-Z0-9]/g, '_');
        const publicId = `${userIdentifier}_${Date.now()}`;

        const uploadOptions: Record<string, unknown> = {
            folder: `shynr/${fileType}s`,
            public_id: publicId,
            resource_type: fileType === 'resume' ? 'raw' : 'image',
        };

        if (fileType === 'avatar' || fileType === 'profile') {
            uploadOptions.transformation = [{ width: 200, height: 200, crop: 'fill', gravity: 'face' }];
        }

        // Upload using stream (Avoiding buffer of full file)
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                uploadOptions,
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );

            // Convert Web Stream to Node Stream
            // @ts-ignore - Readable.fromWeb is available in recent Node versions used by Next.js
            const nodeStream = Readable.fromWeb(file.stream());
            nodeStream.pipe(uploadStream);
        });

        return NextResponse.json({
            success: true,
            data: {
                url: (result as any).secure_url,
                publicId: (result as any).public_id,
                filename: file.name,
                type: fileType,
            },
        });

    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json(
            { success: false, error: 'Internal upload error' },
            { status: 500 }
        );
    }
}

// DELETE /api/upload - Delete file from Cloudinary (with ownership check)
export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, error: 'Authentication required' },
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

        // OWNERSHIP CHECK: Verify the publicId belongs to this user
        const userIdentifier = session.user.email.replace(/[^a-zA-Z0-9]/g, '_');
        const isAdmin = (session.user as { role?: string }).role === 'admin';

        // Extract the filename part from publicId (after folder path)
        const publicIdParts = publicId.split('/');
        const filename = publicIdParts[publicIdParts.length - 1];

        if (!isAdmin && !filename.startsWith(userIdentifier)) {
            return NextResponse.json(
                { success: false, error: 'You can only delete your own files' },
                { status: 403 }
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
