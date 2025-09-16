// biome-ignore format: Layout file uses 4-space indentation for clarity
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
            {/* Document head captures global metadata and PWA configuration */}
            <head>
                {/* Set baseline theme colors for browsers and system UI */}
                <meta name="theme-color" content="#050918" />
                {/* Link to manifest ensures installable PWA experience */}
                <link rel="manifest" href="/manifest.webmanifest" />
                {/* Enable standalone display mode for Apple devices */}
                <meta name="apple-mobile-web-app-capable" content="yes" />
                {/* Customize status bar appearance on Apple devices */}
                <meta
                    name="apple-mobile-web-app-status-bar-style"
                    content="black-translucent"
                />
            </head>
            {/* Apply global fonts and render the application body */}
            <body
                className={`${inter.variable} ${spaceGrotesk.variable} antialiased`}
            >
                {children}
            </body>
        </html>
    );
}
