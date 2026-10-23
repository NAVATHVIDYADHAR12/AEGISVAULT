/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/client', 'argon2', 'express', 'serverless-http'],
};

export default nextConfig;
