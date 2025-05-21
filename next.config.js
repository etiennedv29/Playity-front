/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["static.vecteezy.com", "scienceline.org","api.dicebear.com"],
  },
};

module.exports = nextConfig;
