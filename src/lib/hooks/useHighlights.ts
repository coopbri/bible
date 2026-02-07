import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { onCollectionsReady } from "@/lib/db/collections";
import { highlightsService } from "@/lib/highlights";

import type { BibleVerse } from "@/lib/bibleApi";

interface UseHighlightsOptions {
  versionId: string;
  bookId: number;
  chapter: number;
  verses: BibleVerse[] | undefined;
}

interface UseHighlightsResult {
  /** Map of verse key (`${bookId}-${chapter}-${verse}`) to highlight color. */
  highlightedVerses: Map<string, string>;
  handleHighlightVerse: (verse: BibleVerse, color: string) => void;
  handleRemoveHighlight: (verse: BibleVerse) => void;
}

/**
 * Hook for managing verse highlights.
 */
export function useHighlights({
  versionId,
  bookId,
  chapter,
  verses,
}: UseHighlightsOptions): UseHighlightsResult {
  const [highlightedVerses, setHighlightedVerses] = useState<
    Map<string, string>
  >(new Map());

  // Load highlights for current chapter
  useEffect(() => {
    const loadHighlights = () => {
      if (versionId && bookId && verses) {
        const chapterHighlights = highlightsService.getHighlightsForChapter(
          versionId,
          bookId,
          chapter,
        );
        const highlighted = new Map<string, string>();
        for (const [verseNum, highlight] of chapterHighlights) {
          highlighted.set(`${bookId}-${chapter}-${verseNum}`, highlight.color);
        }
        setHighlightedVerses(highlighted);
      }
    };
    loadHighlights();

    const unsubscribe = onCollectionsReady(() => {
      loadHighlights();
    });
    return unsubscribe;
  }, [versionId, bookId, chapter, verses]);

  const handleHighlightVerse = useCallback(
    (verse: BibleVerse, color: string) => {
      if (!versionId || !bookId) return;

      const key = `${bookId}-${chapter}-${verse.verse}`;

      try {
        highlightsService.addHighlight(
          versionId,
          bookId,
          chapter,
          verse.verse,
          color,
        );
        setHighlightedVerses((prev) => {
          const next = new Map(prev);
          next.set(key, color);
          return next;
        });
        toast.success("Verse highlighted");
      } catch (error) {
        toast.error("Failed to highlight verse");
        console.error(error);
      }
    },
    [versionId, bookId, chapter],
  );

  const handleRemoveHighlight = useCallback(
    (verse: BibleVerse) => {
      if (!versionId || !bookId) return;

      const key = `${bookId}-${chapter}-${verse.verse}`;

      try {
        const highlight = highlightsService.getHighlight(
          versionId,
          bookId,
          chapter,
          verse.verse,
        );
        if (highlight) {
          highlightsService.deleteHighlight(highlight.id);
          setHighlightedVerses((prev) => {
            const next = new Map(prev);
            next.delete(key);
            return next;
          });
          toast.success("Highlight removed");
        }
      } catch (error) {
        toast.error("Failed to remove highlight");
        console.error(error);
      }
    },
    [versionId, bookId, chapter],
  );

  return {
    highlightedVerses,
    handleHighlightVerse,
    handleRemoveHighlight,
  };
}
