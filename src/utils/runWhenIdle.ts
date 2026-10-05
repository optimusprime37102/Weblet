/**
 * Schedule non-urgent work after the UI is idle.
 * Prefer this over deprecated InteractionManager.runAfterInteractions.
 */
export function runWhenIdle(
  callback: () => void,
  options?: { timeout?: number }
): () => void {
  const timeout = options?.timeout ?? 1500;

  if (typeof requestIdleCallback === 'function') {
    const id = requestIdleCallback(() => callback(), { timeout });
    return () => {
      if (typeof cancelIdleCallback === 'function') {
        cancelIdleCallback(id);
      }
    };
  }

  const id = setTimeout(callback, 0);
  return () => clearTimeout(id);
}
