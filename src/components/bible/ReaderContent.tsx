import BibleHeader from "./BibleHeader";
import BookChapterSelector from "./BookChapterSelector";
import ChapterNavigation from "./ChapterNavigation";
import VerseList from "./VerseList";

import type { CSSProperties, RefObject } from "react";
import type { BibleBook, BibleVerse } from "@/lib/bibleApi";

interface ReaderContentProps {
  books: BibleBook[] | undefined;
  selectedBookId: number | null;
  selectedChapter: number;
  targetVerse?: number;
  onBookChange: (bookId: number) => void;
  onChapterChange: (chapter: number) => void;
  currentBook: BibleBook | undefined;
  currentVersionCode: string | undefined;
  verses: BibleVerse[] | undefined;
  versesLoading: boolean;
  bookmarkedVerses: Set<string>;
  highlightedVerses: Map<string, string>;
  holyWordsEnabled: boolean;
  holyWordsColor: string;
  onToggleBookmark: (verse: BibleVerse) => void;
  onShareVerse: (verse: BibleVerse) => void;
  onHighlightVerse: (verse: BibleVerse, color: string) => void;
  onRemoveHighlight: (verse: BibleVerse) => void;
  totalChapters: number;
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  swipeStyle: CSSProperties;
}

/**
 * Main content card with book/chapter selector, verses, and navigation.
 */
const ReaderContent = ({
  books,
  selectedBookId,
  selectedChapter,
  targetVerse,
  onBookChange,
  onChapterChange,
  currentBook,
  currentVersionCode,
  verses,
  versesLoading,
  bookmarkedVerses,
  highlightedVerses,
  holyWordsEnabled,
  holyWordsColor,
  onToggleBookmark,
  onShareVerse,
  onHighlightVerse,
  onRemoveHighlight,
  totalChapters,
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
  scrollContainerRef,
  swipeStyle,
}: ReaderContentProps) => (
  <div className="flex min-h-0 flex-1 flex-col overflow-hidden border-border bg-card sm:rounded-2xl sm:border">
    <div className="shrink-0 bg-primary p-3 sm:p-4 md:p-6">
      <BookChapterSelector
        books={books}
        selectedBookId={selectedBookId}
        selectedChapter={selectedChapter}
        onBookChange={(bookId) => {
          onBookChange(bookId);
        }}
        onChapterChange={onChapterChange}
        currentBook={currentBook}
      />
      {currentBook && currentVersionCode && (
        <BibleHeader
          bookName={currentBook.name}
          chapter={selectedChapter}
          versionCode={currentVersionCode}
        />
      )}
    </div>

    <div
      ref={scrollContainerRef}
      className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-6 md:p-8"
      style={swipeStyle}
    >
      {selectedBookId && (
        <VerseList
          verses={verses}
          versesLoading={versesLoading}
          bookmarkedVerses={bookmarkedVerses}
          highlightedVerses={highlightedVerses}
          selectedBookId={selectedBookId}
          selectedChapter={selectedChapter}
          targetVerse={targetVerse}
          holyWordsEnabled={holyWordsEnabled}
          holyWordsColor={holyWordsColor}
          onToggleBookmark={onToggleBookmark}
          onShareVerse={onShareVerse}
          onHighlightVerse={onHighlightVerse}
          onRemoveHighlight={onRemoveHighlight}
        />
      )}
    </div>

    <div className="shrink-0 bg-primary p-3 sm:p-4 md:p-6">
      <ChapterNavigation
        selectedChapter={selectedChapter}
        totalChapters={totalChapters}
        hasPrevious={hasPrevious}
        hasNext={hasNext}
        onPrevious={onPrevious}
        onNext={onNext}
      />
    </div>
  </div>
);

export default ReaderContent;
