import { useCallback, useRef, useSyncExternalStore } from 'react';

export const DEFAULT_PRESS_GUARD_MS = 700;

type GuardOptions = {
  disabled?: boolean;
  lockMs?: number;
  allowWhileBlocked?: boolean;
};

let blockingInteractionCount = 0;
const listeners = new Set<() => void>();

function emitBlockingInteractionChange() {
  listeners.forEach((listener) => listener());
}

function subscribeBlockingInteraction(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function isBlockingInteractionActive() {
  return blockingInteractionCount > 0;
}

export function beginBlockingInteraction() {
  let released = false;

  blockingInteractionCount += 1;
  emitBlockingInteractionChange();

  return () => {
    if (released) {
      return;
    }

    released = true;
    blockingInteractionCount = Math.max(0, blockingInteractionCount - 1);
    emitBlockingInteractionChange();
  };
}

export function useBlockingInteractionActive() {
  return useSyncExternalStore(
    subscribeBlockingInteraction,
    isBlockingInteractionActive,
    () => false,
  );
}

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'then' in value &&
    typeof value.then === 'function'
  );
}

export function useGuardedPress<TArgs extends unknown[]>(
  handler: ((...args: TArgs) => unknown) | undefined,
  {
    disabled = false,
    lockMs = DEFAULT_PRESS_GUARD_MS,
    allowWhileBlocked = false,
  }: GuardOptions = {},
) {
  const inFlightRef = useRef(false);
  const lastPressAtRef = useRef(0);
  const releaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const guardedHandler = useCallback(
    (...args: TArgs) => {
      if (!handler || disabled || inFlightRef.current) {
        return;
      }

      if (!allowWhileBlocked && isBlockingInteractionActive()) {
        return;
      }

      const now = Date.now();

      if (now - lastPressAtRef.current < lockMs) {
        return;
      }

      lastPressAtRef.current = now;
      inFlightRef.current = true;

      if (releaseTimerRef.current) {
        clearTimeout(releaseTimerRef.current);
        releaseTimerRef.current = null;
      }

      const release = () => {
        inFlightRef.current = false;
      };

      try {
        const result = handler(...args);

        if (isPromiseLike(result)) {
          result.then(release, release);
          return;
        }

        releaseTimerRef.current = setTimeout(release, lockMs);
      } catch (error) {
        release();
        throw error;
      }
    },
    [allowWhileBlocked, disabled, handler, lockMs],
  );

  return handler ? guardedHandler : undefined;
}
