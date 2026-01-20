import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import LinkedInProvider from 'next-auth/providers/linkedin';
import bcrypt from 'bcryptjs';
import dbConnect from '@/db';
import User from '@/db/models/User';
import mongoose from 'mongoose';

export const authOptions: NextAuthOptions = {
    providers: [
        // Google OAuth Provider
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),

        // LinkedIn OAuth Provider
        LinkedInProvider({
            clientId: process.env.LINKEDIN_CLIENT_ID!,
            clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
            authorization: {
                params: { scope: 'openid profile email' },
            },
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
                    throw new Error('Email and password are required');
                }

                await dbConnect();

                const user = await User.findOne({ email: credentials.email.toLowerCase() });

                if (!user) {
                    throw new Error('No account found with this email');
                }

                if (!user.password) {
                    throw new Error('Please sign in with Google or LinkedIn');
                }

                const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

                if (!isPasswordValid) {
                    throw new Error('Invalid password');
                }

                // Update last login
                user.lastLoginAt = new Date();
                await user.save();

                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: `${user.firstName} ${user.lastName}`.trim() || user.email,
                    image: user.profileImage,
                };
            },
        }),
    ],

    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === 'google' || account?.provider === 'linkedin') {
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
                        onboardingCompleted: false,
                        onboardingStep: 1,
                    });
                } else {
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
                await dbConnect();
                const email = user.email?.toLowerCase();
                if (!email) return token;
                const dbUser = await User.findOne({ email });

                if (dbUser) {
                    console.log('JWT Callback - User Found:', {
                        email: dbUser.email,
                        role: dbUser.role,
                        id: dbUser._id,
                        dbName: mongoose.connection.name
                    });
                    token.id = dbUser._id.toString();
                    token.onboardingCompleted = dbUser.onboardingCompleted;
                    token.onboardingStep = dbUser.onboardingStep;
                    token.role = dbUser.role || 'user';
                    console.log('JWT Callback - Role set:', token.role);
                }
            }
            return token;
        },

        async session({ session, token }) {
            console.log('Session Callback - Token:', JSON.stringify(token, null, 2));
            if (session.user) {
                (session.user as any).id = token.id as string;
                (session.user as any).onboardingCompleted = token.onboardingCompleted as boolean;
                (session.user as any).onboardingStep = token.onboardingStep as number | string;
                (session.user as any).role = token.role as 'user' | 'admin';
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
