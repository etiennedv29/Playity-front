/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ["static.vecteezy.com", "scienceline.org", "api.dicebear.com"],
  },
};

module.exports = nextConfig;
