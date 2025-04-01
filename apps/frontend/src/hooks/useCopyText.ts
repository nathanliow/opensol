'use client';

import { useCallback, useState } from 'react';

export function useCopyText() {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const handleCopyText = useCallback(async (val?: string) => {
    // If for some reason the navigator or clipboard is not available, we return early
    if (!navigator || !navigator.clipboard) {
      console.warn('Clipboard not available');
      return;
    }

    if (!val) return;

    try {
      await navigator.clipboard.writeText(val);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      console.warn('Failed to copy text to clipboard', error);
      setIsCopied(false);
    }
  }, []);

  return { isCopied, copy: handleCopyText };
}
