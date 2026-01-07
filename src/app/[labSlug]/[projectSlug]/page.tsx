import React from 'react';
import ProjectWorkspace from '@/features/project/components/ProjectWorkspace';

type ProjectPageProps = {
  params: Promise<{
    labSlug: string;
    projectSlug: string;
  }>;
};

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { labSlug, projectSlug } = await params;
  return <ProjectWorkspace labSlug={labSlug} projectKey={projectSlug} />;
}
