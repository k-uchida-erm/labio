import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    // Alpine arm64-musl 環境で lightningcss バイナリが無い問題を回避
    useLightningcss: false,
    optimizeCss: false,
  },
  env: {
    NEXT_DISABLE_LIGHTNINGCSS: '1',
    LIGHTNINGCSS_WASM: '1',
  },
};

export default nextConfig;
