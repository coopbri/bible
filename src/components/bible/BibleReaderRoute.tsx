import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import {
  PsalmFooter,
  ReaderContent,
  ReaderToolbar,
  ReadingModeView,
} from "@/components/bible";
import { bibleApi } from "@/lib/bibleApi";
import {
  useBibleHotkeys,
  useBookmarks,
  useChapterNavigation,
  useReaderPreferences,
  useScrollHandler,
} from "@/lib/hooks";
import {
  booksOptions,
  chapterOptions,
  versionsOptions,
} from "@/options/bible.options";
import { useTheme } from "@/providers/ThemeProvider";

import type { PsalmQuote } from "@/data/psalmQuotes";
import type { BibleBook, BibleVersion } from "@/lib/bibleApi";

export interface BibleReaderRouteProps {
  versionId: string;
  bookId: number;
  chapter: number;
  readingMode: boolean;
  setReadingMode: (value: boolean | ((prev: boolean) => boolean)) => void;
  psalmQuote: PsalmQuote;
}

function BibleReaderRoute({
  versionId,
  bookId,
  chapter,
  readingMode,
  setReadingMode,
  psalmQuote,
}: BibleReaderRouteProps) {
  const { toggleMode, footerVerseEnabled } = useTheme();

  // Use suspense queries for reactive data
  const { data: versions } = useSuspenseQuery(versionsOptions());
  useSuspenseQuery(booksOptions());
  const { data: verses } = useSuspenseQuery(
    chapterOptions(versionId, bookId, chapter),
  );

  const books = useMemo(
    () => bibleApi.getBooksForVersion(versionId),
    [versionId],
  );

  const currentBook = books?.find((b: BibleBook) => b.id === bookId);
  const currentVersion = versions?.find(
    (v: BibleVersion) => v.id === versionId,
  );

  // UI state for sheets/dialogs
  const [hotkeyHelpOpen, setHotkeyHelpOpen] = useState(false);
  const [bookmarksOpen, setBookmarksOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Custom hooks for separated concerns
  const {
    holyWordsEnabled,
    setHolyWordsEnabled,
    holyWordsColor,
    setHolyWordsColor,
  } = useReaderPreferences({ versionId, bookId, chapter });

  const { bookmarkedVerses, handleToggleBookmark } = useBookmarks({
    versionId,
    bookId,
    chapter,
    verses,
  });

  const {
    navigateToChapter,
    handlePreviousChapter,
    handleNextChapter,
    goHome,
    hasPrevious,
    hasNext,
  } = useChapterNavigation({
    versionId,
    bookId,
    chapter,
    books,
    currentBook,
  });

  const { scrollContainerRef, scrollUp, scrollDown } = useScrollHandler({
    bookId,
    chapter,
    verses,
    handlePreviousChapter,
    handleNextChapter,
  });

  useBibleHotkeys({
    readingMode,
    setReadingMode,
    handlePreviousChapter,
    handleNextChapter,
    scrollUp,
    scrollDown,
    toggleMode,
    setHotkeyHelpOpen,
    setBookmarksOpen,
    setSettingsOpen,
  });

  return (
    <>
      <ReadingModeView
        isOpen={readingMode && !!currentBook && !!currentVersion && !!bookId}
        bookName={currentBook?.name ?? ""}
        chapter={chapter}
        versionCode={currentVersion?.code ?? ""}
        verses={verses}
        versesLoading={false}
        bookmarkedVerses={bookmarkedVerses}
        selectedBookId={bookId ?? 0}
        totalChapters={currentBook?.chapters ?? 0}
        hasPrevious={hasPrevious}
        hasNext={hasNext}
        holyWordsEnabled={holyWordsEnabled}
        holyWordsColor={holyWordsColor}
        scrollContainerRef={scrollContainerRef}
        onExitReadingMode={() => setReadingMode(false)}
        onPreviousChapter={handlePreviousChapter}
        onNextChapter={handleNextChapter}
        onToggleBookmark={handleToggleBookmark}
      />
      <div
        className={`flex h-full flex-col bg-background sm:p-4 md:p-6 ${footerVerseEnabled ? "pb-3 sm:pb-4 md:pb-6" : "pb-0"}`}
      >
        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col overflow-hidden">
          <ReaderToolbar
            onGoHome={goHome}
            bookmarksOpen={bookmarksOpen}
            onBookmarksOpenChange={setBookmarksOpen}
            onBookmarkNavigate={(navBookId, navChapter) => {
              navigateToChapter(versionId, navBookId, navChapter);
            }}
            hotkeyHelpOpen={hotkeyHelpOpen}
            onHotkeyHelpOpenChange={setHotkeyHelpOpen}
            onEnterReadingMode={() => setReadingMode(true)}
            settingsOpen={settingsOpen}
            onSettingsOpenChange={setSettingsOpen}
            versions={versions}
            selectedVersionId={versionId}
            onVersionChange={(newVersionId) => {
              if (newVersionId) {
                const newBooks = bibleApi.getBooksForVersion(newVersionId);
                if (newBooks.some((b) => b.id === bookId)) {
                  navigateToChapter(newVersionId, bookId, chapter);
                } else {
                  navigateToChapter(newVersionId, 1, 1);
                }
              }
            }}
            holyWordsEnabled={holyWordsEnabled}
            onHolyWordsEnabledChange={setHolyWordsEnabled}
            holyWordsColor={holyWordsColor}
            onHolyWordsColorChange={setHolyWordsColor}
          />

          <ReaderContent
            books={books}
            selectedBookId={bookId}
            selectedChapter={chapter}
            onBookChange={(newBookId) => {
              navigateToChapter(versionId, newBookId, 1);
            }}
            onChapterChange={(newChapter) => {
              navigateToChapter(versionId, bookId, newChapter);
            }}
            currentBook={currentBook}
            currentVersionCode={currentVersion?.code}
            verses={verses}
            versesLoading={false}
            bookmarkedVerses={bookmarkedVerses}
            holyWordsEnabled={holyWordsEnabled}
            holyWordsColor={holyWordsColor}
            onToggleBookmark={handleToggleBookmark}
            totalChapters={currentBook?.chapters || 0}
            hasPrevious={hasPrevious}
            hasNext={hasNext}
            onPrevious={handlePreviousChapter}
            onNext={handleNextChapter}
            scrollContainerRef={scrollContainerRef}
          />

          {footerVerseEnabled && (
            <PsalmFooter
              quote={psalmQuote}
              onNavigate={(navChapter) => {
                navigateToChapter(versionId, 19, navChapter); // Psalms = book 19
              }}
            />
          )}
        </div>
      </div>
    </>
  );
}

export default BibleReaderRoute;
