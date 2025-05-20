/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["cdn.pixabay.com", "api.dicebear.com"]
  },
};

module.exports = nextConfig;
