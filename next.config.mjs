import os from "os";

/** Current machine's LAN IPv4 addresses, so dev-server access from a phone
 * on the same WiFi is allowed regardless of which network we're on. */
function getLanIPs() {
  const ips = [];
  for (const iface of Object.values(os.networkInterfaces())) {
    for (const addr of iface ?? []) {
      if (addr.family === "IPv4" && !addr.internal) {
        ips.push(addr.address);
      }
    }
  }
  return ips;
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: getLanIPs(),
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
