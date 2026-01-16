import React, { Suspense } from 'react';
import ProjectWorkspace from '@/features/project/components/ProjectWorkspace';

type ProjectPageProps = {
  params: Promise<{
    labSlug: string;
    projectSlug: string;
  }>;
};

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { labSlug, projectSlug } = await params;
  return (
    <Suspense
      fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}
    >
      <ProjectWorkspace labSlug={labSlug} projectKey={projectSlug} />
    </Suspense>
  );
}
