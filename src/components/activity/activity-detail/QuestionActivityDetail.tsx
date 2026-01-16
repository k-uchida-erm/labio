'use client';

import * as React from 'react';
import { TaskActivityDetail } from './TaskActivityDetail';
import type { ActivityDetailProps } from './types';

type QuestionActivityDetailProps = ActivityDetailProps;

export function QuestionActivityDetail(props: QuestionActivityDetailProps) {
  // 質問用の追加情報があれば表示
  // 現時点ではTaskと同じレイアウトを使用
  return <TaskActivityDetail {...props} />;
}
