import type { NextConfig } from 'next';
import withPWA from 'next-pwa';

const config: NextConfig = {
  experimental: {
    appDir: true,
  },
};

export default withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  fallbacks: {
    document: '/offline',
  },
})(config);
