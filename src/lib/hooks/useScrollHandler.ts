import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

import { userPreferencesService } from "@/lib/userPreferences";

import type { RefObject } from "react";

interface UseScrollHandlerOptions {
  bookId: number;
  chapter: number;
  verses: unknown[] | undefined;
  handlePreviousChapter: () => void;
  handleNextChapter: () => void;
}

interface UseScrollHandlerResult {
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  scrollUp: () => void;
  scrollDown: () => void;
}

const SCROLL_AMOUNT = 200;

/**
 * Hook for managing scroll position save/restore and scroll navigation.
 */
export function useScrollHandler({
  bookId,
  chapter,
  verses,
  handlePreviousChapter,
  handleNextChapter,
}: UseScrollHandlerOptions): UseScrollHandlerResult {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  const prevLocationRef = useRef({ bookId, chapter });

  // Restore scroll position on initial load or reset to top on chapter change
  // useLayoutEffect ensures scroll happens before browser paint
  // biome-ignore lint/correctness/useExhaustiveDependencies: verses triggers scroll reset on chapter load
  useLayoutEffect(() => {
    if (!scrollContainerRef.current) return;

    const locationChanged =
      prevLocationRef.current.bookId !== bookId ||
      prevLocationRef.current.chapter !== chapter;

    if (isInitialMount.current) {
      // Initial mount: restore saved position if same chapter, otherwise top
      const preferences = userPreferencesService.getPreferences();

      if (
        preferences.scrollPosition &&
        preferences.selectedBookId === bookId &&
        preferences.selectedChapter === chapter
      ) {
        scrollContainerRef.current.scrollTop = preferences.scrollPosition;
      } else {
        scrollContainerRef.current.scrollTop = 0;
      }
      isInitialMount.current = false;
    } else if (locationChanged) {
      // Chapter/book changed: scroll to top
      scrollContainerRef.current.scrollTop = 0;
    }

    prevLocationRef.current = { bookId, chapter };
  }, [bookId, chapter, verses]);

  // Save scroll position on scroll
  useEffect(() => {
    const saveScroll = () => {
      if (scrollContainerRef.current) {
        userPreferencesService.savePreferences({
          scrollPosition: scrollContainerRef.current.scrollTop,
        });
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", saveScroll);
      return () => container.removeEventListener("scroll", saveScroll);
    }
  }, []);

  const scrollUp = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    if (container.scrollTop <= 0) {
      handlePreviousChapter();
    } else {
      container.scrollTop -= SCROLL_AMOUNT;
    }
  }, [handlePreviousChapter]);

  const scrollDown = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const isAtBottom =
      container.scrollTop + container.clientHeight >=
      container.scrollHeight - 1;

    if (isAtBottom) {
      handleNextChapter();
    } else {
      container.scrollTop += SCROLL_AMOUNT;
    }
  }, [handleNextChapter]);

  return {
    scrollContainerRef,
    scrollUp,
    scrollDown,
  };
}
