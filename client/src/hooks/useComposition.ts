import { useState, useCallback } from "react";

interface UseCompositionOptions<T> {
  onKeyDown?: (e: React.KeyboardEvent<T>) => void;
  onCompositionStart?: (e: React.CompositionEvent<T>) => void;
  onCompositionEnd?: (e: React.CompositionEvent<T>) => void;
}

export function useComposition<T extends HTMLElement>({
  onKeyDown,
  onCompositionStart,
  onCompositionEnd,
}: UseCompositionOptions<T> = {}) {
  const [isComposing, setIsComposing] = useState(false);

  const handleCompositionStart = useCallback(
    (e: React.CompositionEvent<T>) => {
      setIsComposing(true);
      onCompositionStart?.(e);
    },
    [onCompositionStart]
  );

  const handleCompositionEnd = useCallback(
    (e: React.CompositionEvent<T>) => {
      setIsComposing(false);
      onCompositionEnd?.(e);
    },
    [onCompositionEnd]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<T>) => {
      onKeyDown?.(e);
    },
    [onKeyDown]
  );

  return {
    isComposing,
    onCompositionStart: handleCompositionStart,
    onCompositionEnd: handleCompositionEnd,
    onKeyDown: handleKeyDown,
  };
}
