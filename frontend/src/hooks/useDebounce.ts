import { useRef, useCallback } from 'react';

/**
 * useDebounce hook for debouncing function calls.
 * Prevents rapid-fire API calls while typing.
 * @param callback Function to debounce
 * @param delay Delay in milliseconds
 * @returns Debounced callback function
 */
export function useDebounce<T extends (...args: unknown[]) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedCallback = useCallback(
    ((...args: unknown[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay]
  );

  return debouncedCallback;
}
