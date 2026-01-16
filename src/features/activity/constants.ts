export const MAX_ACTIVITY_LEVELS = 5;

/**
 * Zero-based depth index for the deepest allowed activity.
 * Top-level activities have depth 0, so this ends up being MAX_ACTIVITY_LEVELS - 1.
 */
export const MAX_ACTIVITY_DEPTH_INDEX = MAX_ACTIVITY_LEVELS - 1;

export const MAX_ACTIVITY_DEPTH_ERROR =
  'Activities can only be nested up to five levels. Please adjust the structure before creating deeper items.';
