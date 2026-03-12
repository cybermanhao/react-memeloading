import { useState, useCallback } from 'react';

/**
 * Loading 队列管理 Hook
 * 用于管理多个并发请求的全局 loading 状态
 *
 * @returns {add} 增加计数
 * @returns {remove} 减少计数
 * @returns {count} 当前计数
 * @returns {withLoading} 包装异步函数，自动管理 add/remove
 *
 * @example
 * const { add, remove, count, withLoading } = useLoadingQueue();
 *
 * // 方式1: 手动管理
 * add();
 * fetch('/api').finally(remove);
 *
 * // 方式2: 自动管理
 * await withLoading(fetch('/api'));
 */
export function useLoadingQueue() {
  const [count, setCount] = useState(0);

  const add = useCallback(() => {
    setCount(c => c + 1);
  }, []);

  const remove = useCallback(() => {
    setCount(c => Math.max(0, c - 1));
  }, []);

  const withLoading = useCallback(async function <T>(fn: () => Promise<T>): Promise<T> {
    add();
    try {
      return await fn();
    } finally {
      remove();
    }
  }, [add, remove]);

  return {
    add,
    remove,
    count,
    withLoading,
  };
}
