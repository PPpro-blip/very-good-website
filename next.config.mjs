/**
 * WOW GAMES — static-exportable Next.js App Router build.
 * `output: 'export'` keeps hosting dead simple and fast on Netlify (no server runtime).
 * All interactivity happens client-side; pages are still pre-rendered for SEO.
 */
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  reactStrictMode: true,
  images: { unoptimized: true },
  poweredByHeader: false,
};

export default nextConfig;
