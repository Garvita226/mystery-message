import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
export { default } from "next-auth/middleware"

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
    const token = await getToken({req: request})
    const url = request.nextUrl.pathname

    if (token && (
        url.startsWith('/signin') ||
        url.startsWith('/signup') ||
        url.startsWith('/verify') ||
        url.startsWith('/')
    )) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }


    if (!token && url.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL("/signin", request.url));
    }

}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/signin", "/signup", "/", "/dashboard/:path*", "/verify/:path*"],
};
