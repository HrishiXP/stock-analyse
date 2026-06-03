import type { Metadata } from 'next';
import './globals.css';
import SessionWrapper from '../components/layout/SessionWrapper';

export const metadata: Metadata = {
  title: 'NSE-FO-Radar',
  description: 'Ultra-advanced AI-powered F&O signal intelligence platform for Indian markets.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <SessionWrapper>{children}</SessionWrapper>
      </body>
    </html>
  );
}
