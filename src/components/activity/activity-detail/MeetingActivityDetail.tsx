'use client';

import * as React from 'react';
import { TaskActivityDetail } from './TaskActivityDetail';
import type { ActivityDetailProps } from './types';

type MeetingActivityDetailProps = ActivityDetailProps;

export function MeetingActivityDetail(props: MeetingActivityDetailProps) {
  // 面談・ゼミ用の追加情報があれば表示
  // 現時点ではTaskと同じレイアウトを使用
  return <TaskActivityDetail {...props} />;
}
