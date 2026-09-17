'use client';

import { useEffect, useRef } from 'react';
import { pushHistory, type HistoryRecord } from '@/lib/store';

/** 进入详情页时写入浏览历史（个人中心「浏览历史」数据来源） */
export default function HistoryRecorder(props: Omit<HistoryRecord, 'at'>) {
  const done = useRef(false);
  const { id, type, title, href, cover } = props;

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    pushHistory({ id, type, title, href, cover });
  }, [id, type, title, href, cover]);

  return null;
}
