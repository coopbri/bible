import { Bookmark } from "lucide-react";
import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatVerseText } from "@/lib/verseFormatter";
import VerseActionMenu, { VerseDropdownMenu } from "./VerseActionMenu";

import type { BibleVerse } from "@/lib/bibleApi";

interface VerseListProps {
  verses: BibleVerse[] | undefined;
  versesLoading: boolean;
  bookmarkedVerses: Set<string>;
  highlightedVerses: Map<string, string>;
  selectedBookId: number;
  selectedChapter: number;
  targetVerse?: number;
  holyWordsEnabled: boolean;
  holyWordsColor: string;
  onToggleBookmark: (verse: BibleVerse) => void;
  onShareVerse: (verse: BibleVerse) => void;
  onHighlightVerse: (verse: BibleVerse, color: string) => void;
  onRemoveHighlight: (verse: BibleVerse) => void;
}

/**
 * Displays a list of Bible verses with bookmark, share, and highlight functionality.
 */
const VerseList = ({
  verses,
  versesLoading,
  bookmarkedVerses,
  highlightedVerses,
  selectedBookId,
  selectedChapter,
  targetVerse,
  holyWordsEnabled,
  holyWordsColor,
  onToggleBookmark,
  onShareVerse,
  onHighlightVerse,
  onRemoveHighlight,
}: VerseListProps) => {
  const targetRef = useRef<HTMLDivElement>(null);

  // Scroll to target verse on mount (from shared link)
  useEffect(() => {
    if (targetVerse && targetRef.current) {
      targetRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [targetVerse]);

  if (versesLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-full" />
        ))}
      </div>
    );
  }

  if (!verses || verses.length === 0) {
    return (
      <p className="py-12 text-center font-serif text-muted-foreground italic">
        No verses found for this chapter.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {verses.map((verse: BibleVerse) => {
        const formatted = formatVerseText(verse.text);
        const verseKey = `${selectedBookId}-${selectedChapter}-${verse.verse}`;
        const isBookmarked = bookmarkedVerses.has(verseKey);
        const highlightColor = highlightedVerses.get(verseKey);
        const isTarget = targetVerse === verse.verse;

        return (
          <VerseActionMenu
            key={verse.id}
            verse={verse}
            isBookmarked={isBookmarked}
            highlightColor={highlightColor}
            onToggleBookmark={onToggleBookmark}
            onShareVerse={onShareVerse}
            onHighlightVerse={onHighlightVerse}
            onRemoveHighlight={onRemoveHighlight}
          >
            <div
              ref={isTarget ? targetRef : undefined}
              data-verse={verse.verse}
              className={`group -mx-2 flex items-start gap-4 rounded-lg px-2 py-1 transition-colors ${
                isTarget ? "animate-pulse ring-2 ring-primary/50" : ""
              }`}
              style={{
                backgroundColor: highlightColor
                  ? `${highlightColor}40`
                  : undefined,
              }}
            >
              <span className="min-w-10 shrink-0 font-bold font-serif text-base text-primary">
                {verse.verse}
              </span>
              <div className="flex-1">
                {formatted.title && (
                  <h3 className="mb-2 font-bold font-serif text-primary text-xl">
                    {formatted.title}
                  </h3>
                )}
                <p
                  className={`text-left font-serif text-lg leading-loose ${isBookmarked ? "font-semibold" : ""}`}
                  style={{
                    color:
                      holyWordsEnabled && verse.is_holy_words
                        ? holyWordsColor
                        : "inherit",
                  }}
                >
                  {formatted.text}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 shrink-0 transition-opacity ${
                    isBookmarked
                      ? "opacity-100"
                      : "opacity-40 hover:opacity-100 active:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                  }`}
                  onClick={() => onToggleBookmark(verse)}
                >
                  <Bookmark
                    className={`h-4 w-4 ${isBookmarked ? "fill-current text-primary" : ""}`}
                  />
                </Button>
                <VerseDropdownMenu
                  verse={verse}
                  isBookmarked={isBookmarked}
                  highlightColor={highlightColor}
                  onToggleBookmark={onToggleBookmark}
                  onShareVerse={onShareVerse}
                  onHighlightVerse={onHighlightVerse}
                  onRemoveHighlight={onRemoveHighlight}
                />
              </div>
            </div>
          </VerseActionMenu>
        );
      })}
    </div>
  );
};

export default VerseList;
