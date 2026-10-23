/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['127.0.0.1'],
  serverExternalPackages: ['@prisma/client', 'argon2', 'express', 'serverless-http'],
};

export default nextConfig;
