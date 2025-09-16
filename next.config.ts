import type { NextConfig } from 'next';
import withPWA from 'next-pwa';

const withPWAPreset = withPWA({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
    register: true,
    skipWaiting: true,
    fallbacks: {
        document: '/offline',
    },
});

const baseConfig: NextConfig = {
    turbopack: {},
};

const isTurbopack =
    process.env.NEXT_RUNTIME === 'turbopack' || process.env.NEXT_TURBOPACK === '1';

const applyPWAPreset = (): NextConfig => withPWAPreset({ ...baseConfig });

const nextConfig: NextConfig = isTurbopack
    ? baseConfig
    : { ...applyPWAPreset(), ...baseConfig };

export default nextConfig;
