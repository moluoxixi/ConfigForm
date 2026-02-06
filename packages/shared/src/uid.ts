/** 自增 ID 计数器 */
let counter = 0;

/**
 * 生成唯一 ID
 * @param prefix - ID 前缀，默认 'cf'
 */
export function uid(prefix = 'cf'): string {
  return `${prefix}_${++counter}_${Math.random().toString(36).slice(2, 8)}`;
}

/** 重置计数器（仅用于测试） */
export function resetUidCounter(): void {
  counter = 0;
}
