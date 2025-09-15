declare module 'next-pwa' {
  import type { NextConfig } from 'next';

  export interface PWAOptions {
    dest?: string;
    disable?: boolean;
    register?: boolean;
    skipWaiting?: boolean;
    runtimeCaching?: unknown[];
    fallbacks?: Record<string, string>;
    [key: string]: unknown;
  }

  type WithPWA = (nextConfig?: NextConfig) => NextConfig;

  export default function withPWA(options?: PWAOptions): WithPWA;
}
