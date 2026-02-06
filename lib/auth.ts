import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

import bcrypt from 'bcryptjs';
import dbConnect from '@/db';
import User from '@/db/models/User';
import { loginRateLimiter } from './rateLimit';

// Generic error message to prevent enumeration
const GENERIC_AUTH_ERROR = 'Invalid email or password';

export const authOptions: NextAuthOptions = {
    providers: [
        // Google OAuth Provider
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),


        // Email/Password Credentials Provider
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error(GENERIC_AUTH_ERROR);
                }

                const email = credentials.email.toLowerCase();

                // Check rate limit BEFORE any database operations
                const rateCheck = loginRateLimiter.check(email);
                if (rateCheck.limited) {
                    const retryMinutes = Math.ceil(rateCheck.retryAfterMs / 60000);
                    throw new Error(`Too many login attempts. Try again in ${retryMinutes} minute(s).`);
                }

                await dbConnect();

                // First, check if this is an admin login
                const Admin = (await import('@/db/models/Admin')).default;
                const admin = await Admin.findOne({ email });

                if (admin) {
                    // Check if admin is active
                    if (admin.isActive === false) {
                        throw new Error('Your account has been deactivated. Please contact support.');
                    }

                    // Verify admin password
                    const isPasswordValid = await bcrypt.compare(credentials.password, admin.password);
                    if (!isPasswordValid) {
                        throw new Error(GENERIC_AUTH_ERROR);
                    }

                    // Reset rate limit on successful login
                    loginRateLimiter.reset(email);

                    // Update last login
                    admin.lastLoginAt = new Date();
                    await admin.save();

                    return {
                        id: admin._id.toString(),
                        email: admin.email,
                        name: `${admin.firstName} ${admin.lastName}`.trim() || admin.email,
                        image: admin.profileImage,
                        role: 'admin',
                    };
                }

                // If not admin, check regular user
                const user = await User.findOne({ email });

                if (!user) {
                    // Use same error to prevent enumeration
                    throw new Error(GENERIC_AUTH_ERROR);
                }

                if (!user.password) {
                    // User exists but signed up with OAuth
                    throw new Error('Please sign in with Google');
                }

                // Check if user is active
                if (user.isActive === false) {
                    throw new Error('Your account has been deactivated. Please contact support.');
                }

                const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

                if (!isPasswordValid) {
                    throw new Error(GENERIC_AUTH_ERROR);
                }

                // Reset rate limit on successful login
                loginRateLimiter.reset(email);

                // Update last login
                user.lastLoginAt = new Date();
                await user.save();

                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: `${user.firstName} ${user.lastName}`.trim() || user.email,
                    image: user.profileImage,
                    role: user.role || 'user',
                };
            },
        }),
    ],

    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === 'google') {
                await dbConnect();

                const userEmail = user.email?.toLowerCase();
                if (!userEmail) return false;

                // Check if user exists
                let existingUser = await User.findOne({ email: userEmail });

                if (!existingUser) {
                    // Create new user for OAuth sign in
                    existingUser = await User.create({
                        email: userEmail,
                        provider: account.provider,
                        providerId: account.providerAccountId,
                        firstName: (profile as { given_name?: string })?.given_name || user.name?.split(' ')[0] || '',
                        lastName: (profile as { family_name?: string })?.family_name || user.name?.split(' ').slice(1).join(' ') || '',
                        profileImage: user.image || undefined,
                        emailVerified: true,
                        onboardingCompleted: true,
                        onboardingStep: 'complete',
                    });
                } else {
                    // Check if existing user is active
                    if (existingUser.isActive === false) {
                        return false; // Block login for inactive users
                    }

                    // Update last login
                    existingUser.lastLoginAt = new Date();
                    if (!existingUser.profileImage && user.image) {
                        existingUser.profileImage = user.image;
                    }
                    await existingUser.save();
                }
            }

            return true;
        },

        async jwt({ token, user }) {
            if (user) {
                // If the user has a role from authorize, use it directly
                if ((user as { role?: string }).role === 'admin') {
                    token.id = user.id;
                    token.role = 'admin';
                    token.onboardingCompleted = true;
                    token.onboardingStep = 'complete';
                    return token;
                }

                // For regular users, check the database
                await dbConnect();
                const email = user.email?.toLowerCase();
                if (!email) return token;
                const dbUser = await User.findOne({ email });

                if (dbUser) {
                    token.id = dbUser._id.toString();
                    token.onboardingCompleted = dbUser.onboardingCompleted;
                    token.onboardingStep = dbUser.onboardingStep;
                    token.role = dbUser.role || 'user';
                }
            }
            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                (session.user as { id?: string }).id = token.id as string;
                (session.user as { onboardingCompleted?: boolean }).onboardingCompleted = token.onboardingCompleted as boolean;
                (session.user as { onboardingStep?: number | string }).onboardingStep = token.onboardingStep as number | string;
                (session.user as { role?: string }).role = token.role as 'user' | 'admin' | 'employee';
            }
            return session;
        },
    },

    pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
    },

    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },

    secret: process.env.NEXTAUTH_SECRET,
};
