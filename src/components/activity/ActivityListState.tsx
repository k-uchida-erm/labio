type SupabaseLikeError = {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
};

export type ActivityListStateProps = {
  labError?: SupabaseLikeError | null;
  projectError?: SupabaseLikeError | null;
  activitiesError?: SupabaseLikeError | null;
  loading?: boolean;
  userLoading?: boolean;
  parentCount: number;
  activitiesCount: number;
};

export function ActivityListState({
  labError,
  projectError,
  activitiesError,
  loading = false,
  userLoading = false,
  parentCount,
  activitiesCount,
}: ActivityListStateProps) {
  const renderLabError = () => {
    if (!labError) return null;
    const showAuthBlock =
      labError.message?.includes('403') ||
      labError.message?.includes('Forbidden') ||
      labError.code === 'PGRST301' ||
      labError.code === '42501';

    return (
      <div className="px-2 text-xs text-red-500">
        <div className="font-semibold">Error loading lab: {labError.message}</div>
        {labError.code && (
          <div className="mt-1 text-xs text-slate-600">Error code: {labError.code}</div>
        )}
        {labError.details && typeof labError.details === 'string' && (
          <div className="mt-1 text-xs text-slate-600">Details: {labError.details}</div>
        )}
        {labError.hint && <div className="mt-1 text-xs text-slate-600">Hint: {labError.hint}</div>}
        {showAuthBlock && (
          <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
            <div className="font-semibold">Authentication or Authorization Error</div>
            <div className="mt-1">
              Please make sure you are:
              <ul className="mt-1 ml-2 list-inside list-disc">
                <li>Logged in to your account</li>
                <li>A member of this lab</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (labError) return renderLabError();
  if (projectError)
    return (
      <div className="px-2 text-xs text-red-500">Error loading project: {projectError.message}</div>
    );
  if (activitiesError)
    return (
      <div className="px-2 text-xs text-red-500">
        Error loading activities: {activitiesError.message}
      </div>
    );
  if (loading) return <div className="px-2 text-xs text-slate-500">Loading activities...</div>;
  if (userLoading)
    return <div className="px-2 text-xs text-slate-500">Loading your profile...</div>;
  if (parentCount === 0 && activitiesCount === 0)
    return <div className="px-2 text-xs text-slate-500">No activities found</div>;

  return null;
}

export default ActivityListState;
