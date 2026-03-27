import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Secure Identity & Fraud Prevention System',
  description:
    'Enterprise-grade fraud prevention and identity verification platform with advanced risk scoring and TOTP-based 2FA',
  keywords: [
    'fraud detection',
    'identity verification',
    'security',
    'TOTP',
    '2FA',
    'risk scoring',
  ],
  authors: [{ name: 'Security Team' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
