import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/login',
  },
});

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/scanner/:path*',
    '/analysis/:path*',
    '/news/:path*',
    '/api/signals/:path*',
    '/api/scan/:path*',
    '/api/news/:path*',
    '/api/mood/:path*',
  ],
};
