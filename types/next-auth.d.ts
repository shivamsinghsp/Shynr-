import 'next-auth';
import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            onboardingCompleted: boolean;
            onboardingStep: number | string;
            role: 'user' | 'admin';
        } & DefaultSession['user'];
    }

    interface User extends DefaultUser {
        id: string;
        onboardingCompleted?: boolean;
        onboardingStep?: number | string;
        role?: 'user' | 'admin';
    }
}

declare module 'next-auth/jwt' {
    interface JWT extends DefaultJWT {
        id: string;
        onboardingCompleted: boolean;
        onboardingStep: number | string;
        role: 'user' | 'admin';
    }
}
