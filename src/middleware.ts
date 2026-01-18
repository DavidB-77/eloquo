import { type NextRequest, NextResponse } from 'next/server'

// Middleware for Better Auth
// Routes are handled by Better Auth automatically via the API route handler
// This middleware just handles any additional route protection if needed

export async function middleware(request: NextRequest) {
    // For now, allow all routes - Better Auth handles session management
    // Protected routes can be added here later

    const pathname = request.nextUrl.pathname;

    // Maintenance Mode - Set to true to enable global maintenance page
    const isMaintenanceMode = false;

    if (isMaintenanceMode) {
        // Allow access to the maintenance page and static assets
        if (
            !pathname.startsWith('/maintenance') &&
            !pathname.startsWith('/_next') &&
            !pathname.startsWith('/admin-signup') &&
            !pathname.startsWith('/api/auth') &&
            !pathname.match(/\.(.*)$/)
        ) {
            return NextResponse.redirect(new URL('/maintenance', request.url));
        }
    }

    // Public routes that don't need any checks
    const publicRoutes = [
        '/',
        '/login',
        '/signup',
        '/forgot-password',
        '/reset-password',
        '/select-plan',
        '/api/auth',
        '/api/webhooks',
        '/test-convex',
        '/admin-signup',
    ];

    // Check if it's a public route
    const isPublicRoute = publicRoutes.some(route =>
        pathname === route || pathname.startsWith(route + '/')
    );

    // Allow public routes
    if (isPublicRoute) {
        return NextResponse.next();
    }

    // For now, allow all other routes too
    // Better Auth session checking is done via hooks in components
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
