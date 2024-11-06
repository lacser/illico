import type { NextConfig } from 'next';
import type { Configuration as WebpackConfig } from 'webpack';

interface CustomNextConfig extends NextConfig {
  webpack: (config: WebpackConfig) => WebpackConfig;
}

const nextConfig: CustomNextConfig = {
  webpack: (config: WebpackConfig) => {
    if (!config.externals) {
      config.externals = [];
    }
    if (Array.isArray(config.externals)) {
      config.externals.push({
        'utf-8-validate': 'commonjs utf-8-validate',
        'bufferutil': 'commonjs bufferutil',
      });
    }
    return config;
  },
};

export default nextConfig;
