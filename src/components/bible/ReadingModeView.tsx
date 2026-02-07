import { Minimize2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ChapterNavigation from "./ChapterNavigation";
import VerseList from "./VerseList";

import type { CSSProperties, RefObject } from "react";
import type { BibleVerse } from "@/lib/bibleApi";

interface ReadingModeViewProps {
  isOpen: boolean;
  bookName: string;
  chapter: number;
  versionCode: string;
  verses: BibleVerse[] | undefined;
  versesLoading: boolean;
  bookmarkedVerses: Set<string>;
  highlightedVerses: Map<string, string>;
  selectedBookId: number;
  totalChapters: number;
  hasPrevious: boolean;
  hasNext: boolean;
  holyWordsEnabled: boolean;
  holyWordsColor: string;
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  onExitReadingMode: () => void;
  onPreviousChapter: () => void;
  onNextChapter: () => void;
  onToggleBookmark: (verse: BibleVerse) => void;
  onShareVerse: (verse: BibleVerse) => void;
  onHighlightVerse: (verse: BibleVerse, color: string) => void;
  onRemoveHighlight: (verse: BibleVerse) => void;
  swipeStyle: CSSProperties;
}

/**
 * Fullscreen reading mode view for distraction-free Bible reading.
 */
const ReadingModeView = ({
  isOpen,
  bookName,
  chapter,
  versionCode,
  verses,
  versesLoading,
  bookmarkedVerses,
  highlightedVerses,
  selectedBookId,
  totalChapters,
  hasPrevious,
  hasNext,
  holyWordsEnabled,
  holyWordsColor,
  scrollContainerRef,
  onExitReadingMode,
  onPreviousChapter,
  onNextChapter,
  onToggleBookmark,
  onShareVerse,
  onHighlightVerse,
  onRemoveHighlight,
  swipeStyle,
}: ReadingModeViewProps) => {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isAnimating, setIsAnimating] = useState(isOpen);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      // Skip animation on initial mount - show immediately if already open
      if (isOpen) {
        setShouldRender(true);
        setIsAnimating(true);
      }
      return;
    }

    // Normal animation logic for subsequent changes
    if (isOpen) {
      setShouldRender(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      const timeout = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col overflow-hidden bg-card transition-all duration-300 ease-out",
        isAnimating
          ? "scale-100 opacity-100"
          : "pointer-events-none scale-95 opacity-0",
      )}
    >
      <div className="shrink-0 bg-primary px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-baseline gap-3">
            <h2 className="font-bold font-serif text-primary-foreground text-xl sm:text-2xl">
              {bookName}
            </h2>
            <span className="font-light font-serif text-lg text-primary-foreground/80 sm:text-xl">
              {chapter}
            </span>
            <span className="font-sans text-primary-foreground/70 text-xs uppercase tracking-wider">
              {versionCode}
            </span>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={onExitReadingMode}
            className="border-primary-foreground/30 bg-background/20 backdrop-blur-sm hover:bg-background/30"
            title="Exit reading mode (F)"
          >
            <Minimize2 className="h-5 w-5 text-primary-foreground" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-12"
        style={swipeStyle}
      >
        <div className="mx-auto max-w-4xl">
          <VerseList
            verses={verses}
            versesLoading={versesLoading}
            bookmarkedVerses={bookmarkedVerses}
            highlightedVerses={highlightedVerses}
            selectedBookId={selectedBookId}
            selectedChapter={chapter}
            holyWordsEnabled={holyWordsEnabled}
            holyWordsColor={holyWordsColor}
            onToggleBookmark={onToggleBookmark}
            onShareVerse={onShareVerse}
            onHighlightVerse={onHighlightVerse}
            onRemoveHighlight={onRemoveHighlight}
          />
        </div>
      </div>

      <div className="shrink-0 bg-primary px-4 py-3 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <ChapterNavigation
            selectedChapter={chapter}
            totalChapters={totalChapters}
            hasPrevious={hasPrevious}
            hasNext={hasNext}
            onPrevious={onPreviousChapter}
            onNext={onNextChapter}
          />
        </div>
      </div>
    </div>
  );
};

export default ReadingModeView;
