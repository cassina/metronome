import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';

import { APP_DESCRIPTION, APP_TITLE, HTML_LANGUAGE } from '@/lib/constants';

import './globals.css';

const inter = Inter({
  variable: '--font-body',
  display: 'swap',
  subsets: ['latin'],
});

const spaceGrotesk = Space_Grotesk({
  variable: '--font-display',
  display: 'swap',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: APP_TITLE,
  description: APP_DESCRIPTION,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={HTML_LANGUAGE}>
      <head>
        <meta name="theme-color" content="#050918" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </head>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
