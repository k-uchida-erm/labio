import type { Meta, StoryObj } from '@storybook/nextjs';
import ProjectHeader from '@/components/project/ProjectHeader';

const meta: Meta<typeof ProjectHeader> = {
  title: 'Project/ProjectHeader',
  component: ProjectHeader,
  args: {
    projectKey: 'PINN',
    projectTitle: 'PINN Project',
    assignees: [
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
    ],
  },
};

export default meta;

type Story = StoryObj<typeof ProjectHeader>;

export const Default: Story = {};

export const LongTitle: Story = {
  args: {
    projectTitle: 'Very Long Project Title To Verify Truncationあああああああああああああああ',
  },
};
