export { default } from 'next-auth/middleware';

export const config = {
  // Routes to protect
  matcher: [
    '/dashboard/:path*',
    '/analysis/:path*',
    '/news/:path*',
    '/scanner/:path*',
    '/api/signals/:path*',
    '/api/scan/:path*',
    '/api/news/:path*',
    '/api/mood/:path*',
  ],
};
