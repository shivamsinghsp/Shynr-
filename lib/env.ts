/**
 * Environment variable validation
 * This module validates required environment variables at startup
 * and fails fast if any are missing or invalid.
 */

interface EnvConfig {
    required: string[];
    optional: string[];
}

const envConfig: EnvConfig = {
    required: [
        'MONGODB_URI',
        'NEXTAUTH_SECRET',
        'NEXTAUTH_URL',
    ],
    optional: [
        'GOOGLE_CLIENT_ID',
        'GOOGLE_CLIENT_SECRET',
        'CLOUDINARY_CLOUD_NAME',
        'CLOUDINARY_API_KEY',
        'CLOUDINARY_API_SECRET',
        'SMTP_HOST',
        'SMTP_PORT',
        'SMTP_USER',
        'SMTP_PASSWORD',
        'SMTP_FROM_EMAIL',
        'SMTP_FROM_NAME',
        'ADMIN_EMAIL',
        'ADMIN_PASSWORD',
    ]
};

export function validateEnv(): void {
    const missing: string[] = [];
    const warnings: string[] = [];

    // Check required variables
    for (const key of envConfig.required) {
        if (!process.env[key]) {
            missing.push(key);
        }
    }

    // Warn about weak NEXTAUTH_SECRET
    const secret = process.env.NEXTAUTH_SECRET;
    if (secret) {
        if (secret.length < 32) {
            warnings.push('NEXTAUTH_SECRET is too short. Use at least 32 characters.');
        }
        if (secret.includes('change-this') || secret.includes('your-') || secret.includes('placeholder')) {
            warnings.push('NEXTAUTH_SECRET appears to be a placeholder. Generate a secure secret.');
        }
    }

    // Check NEXTAUTH_URL in production
    if (process.env.NODE_ENV === 'production') {
        const url = process.env.NEXTAUTH_URL;
        if (url && url.includes('localhost')) {
            warnings.push('NEXTAUTH_URL contains localhost but running in production mode.');
        }
    }

    // Log warnings
    for (const warning of warnings) {
        console.warn(`⚠️  ENV WARNING: ${warning}`);
    }

    // Fail fast if required vars are missing
    if (missing.length > 0) {
        const message = `Missing required environment variables: ${missing.join(', ')}`;
        console.error(`❌ ENV ERROR: ${message}`);

        if (process.env.NODE_ENV === 'production') {
            throw new Error(message);
        }
    }
}

// Export for use in other modules
export function isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
}

export function isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
}

// Validate on module load
validateEnv();
