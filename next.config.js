const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.alias = config.resolve.alias || {};
      config.resolve.alias['async_hooks'] = path.resolve(__dirname, 'scripts/async-hooks-polyfill.js');
    }
    return config;
  },
};

module.exports = nextConfig;
