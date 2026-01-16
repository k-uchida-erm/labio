'use client';

import * as React from 'react';
import { TaskActivityDetail } from './TaskActivityDetail';
import type { ActivityDetailProps } from './types';

type NoteActivityDetailProps = ActivityDetailProps;

export function NoteActivityDetail(props: NoteActivityDetailProps) {
  // メモ用の追加情報があれば表示
  // 現時点ではTaskと同じレイアウトを使用
  return <TaskActivityDetail {...props} />;
}
