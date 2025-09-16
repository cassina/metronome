import type { NextConfig } from 'next';
import withPWA from 'next-pwa';

const config: NextConfig = {
    turbopack: {},
};

const withPWAPreset = withPWA({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
    register: true,
    skipWaiting: true,
    fallbacks: {
        document: '/offline',
    },
});

const isTurbopack =
    process.env.NEXT_RUNTIME === 'turbopack' || process.env.NEXT_TURBOPACK === '1';

const nextConfig = isTurbopack ? config : withPWAPreset(config);

export default nextConfig;
