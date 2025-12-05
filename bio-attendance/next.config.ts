import type { NextConfig } from "next";

const nextConfig: NextConfig = {
                images: {
                  remotePatterns: [
                    {
                      protocol: 'https',
                      hostname: 'festive-robin-55.convex.cloud',
                      pathname: '/**',
                    },
                  ],
                },
              };

export default nextConfig;
