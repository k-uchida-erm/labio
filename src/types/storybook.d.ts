declare module '@storybook/nextjs' {
  import type { Meta as ReactMeta, StoryObj as ReactStoryObj } from '@storybook/react';

  export type Meta<T> = ReactMeta<T>;
  export type StoryObj<T> = ReactStoryObj<T>;
}
