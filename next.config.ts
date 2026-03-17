import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable Turbopack — use Webpack for dev
  turbopack: undefined,
  serverExternalPackages: [
    "twilio",
    "stripe",
    "resend",
  ],
};

export default nextConfig;
