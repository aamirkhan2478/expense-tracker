/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Don't bundle mjml and its heavy Node-only dependencies on the server.
      // The pre-compiled templates are used at runtime; mjml is only needed
      // for the build script.
      config.externals.push("mjml");
    }
    return config;
  },
};

module.exports = nextConfig;
