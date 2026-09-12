/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    qualities: [75, 92],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "pub-3f333c9b625c471bb1563b8510f1ff18.r2.dev",
      },
    ],
  },
};

export default nextConfig;
