import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        // Custom logic can go here if needed, e.g. role checks
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;

        // Admin route protection
        if (path.startsWith("/admin") && token?.role !== "admin") {
            return NextResponse.redirect(new URL("/auth/signin", req.url));
        }

        // Employee route protection
        if (path.startsWith("/employee")) {
            const userRole = token?.role as string | undefined;
            if (userRole !== "employee" && userRole !== "admin") {
                return NextResponse.redirect(new URL("/auth/signin", req.url));
            }
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = {
    matcher: [
        "/admin/(.*)",
        "/employee/(.*)",
        "/jobs/:path*",
        "/applications/:path*",
        "/profile/:path*",
        "/settings/:path*",
        "/attendance/:path*",
        "/leave/:path*"
    ],
};
