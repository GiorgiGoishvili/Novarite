/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Prevent Next.js from bundling server-only Node.js packages into the
    // client bundle. twilio uses Node built-ins (http, crypto, etc.) that
    // are not available in the browser.
    serverComponentsExternalPackages: ["twilio"],
  },
};

module.exports = nextConfig;
