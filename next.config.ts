import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // SCSS 通过 dart-sass 编译，这里静默掉 legacy JS API 的告警
  sassOptions: {
    silenceDeprecations: ['legacy-js-api', 'import', 'global-builtin'],
  },
};

export default nextConfig;
