
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const token = await getToken({ req });
    return NextResponse.json({
        message: "Debug Session Info",
        token_role: token?.role,
        token_email: token?.email,
        token_full: token
    });
}
