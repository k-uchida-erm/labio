import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import type { StorybookConfig } from '@storybook/nextjs-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-onboarding',
  ],
  framework: '@storybook/nextjs-vite',
  staticDirs: ['../public'],
  viteFinal: async (config) => {
    return {
      ...config,
      resolve: {
        ...(config.resolve || {}),
        alias: {
          ...(config.resolve?.alias || {}),
          '@': path.resolve(__dirname, '../src'),
        },
      },
      server: {
        ...(config.server || {}),
        allowedHosts: true,
      },
    };
  },
};
export default config;
