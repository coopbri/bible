import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";

import { BibleReaderRoute } from "@/components/bible";
import { Skeleton } from "@/components/ui/skeleton";
import { PSALM_QUOTES, getRandomPsalmQuote } from "@/data/psalmQuotes";
import { bibleApi } from "@/lib/bibleApi";
import {
  booksOptions,
  chapterOptions,
  versionsOptions,
} from "@/options/bible.options";
import {
  getBooksServerFn,
  getChapterServerFn,
  getVersionsServerFn,
} from "@/server/functions/bible";

import type { PsalmQuote } from "@/data/psalmQuotes";

interface SearchParams {
  fullscreen?: boolean;
}

export const Route = createFileRoute("/$version/$book/$chapter")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    fullscreen: search.fullscreen === true || search.fullscreen === "true",
  }),
  loader: async ({ params, context: { queryClient } }) => {
    const versionId = params.version;
    const bookId = parseInt(params.book, 10);
    const chapter = parseInt(params.chapter, 10);

    // Redirect DC books unsupported by this version to Genesis 1
    if (bookId > 66) {
      const versionBooks = bibleApi.getBooksForVersion(versionId);
      if (!versionBooks.some((b) => b.id === bookId)) {
        throw redirect({
          to: "/$version/$book/$chapter",
          params: { version: versionId, book: "1", chapter: "1" },
        });
      }
    }

    // Prefetch data using server functions
    const [versions, books, verses] = await Promise.all([
      queryClient.ensureQueryData({
        ...versionsOptions(),
        queryFn: () => getVersionsServerFn(),
      }),
      queryClient.ensureQueryData({
        ...booksOptions(),
        queryFn: () => getBooksServerFn(),
      }),
      queryClient.ensureQueryData({
        ...chapterOptions(versionId, bookId, chapter),
        queryFn: () =>
          getChapterServerFn({ data: { versionId, bookId, chapter } }),
      }),
    ]);

    return { versions, books, verses, versionId, bookId, chapter };
  },
  head: ({ loaderData }) => {
    const version = loaderData?.versions?.find(
      (v) => v.id === loaderData?.versionId,
    );
    const book = loaderData?.books?.find((b) => b.id === loaderData?.bookId);
    const chapter = loaderData?.chapter;

    const versionCode = version?.code ?? "KJV";
    const bookName = book?.name ?? "Genesis";
    const chapterNum = chapter ?? 1;

    const title = `${bookName} ${chapterNum} ${versionCode} | Holy Bible`;

    return {
      meta: [
        { title },
        { property: "og:title", content: title },
        { name: "twitter:title", content: title },
      ],
    };
  },
  pendingComponent: LoadingSkeleton,
  component: BibleReaderWrapper,
});

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="mx-auto max-w-5xl">
        <Skeleton className="mb-8 h-16 w-64" />
        <Skeleton className="h-[70vh] w-full rounded-2xl" />
      </div>
    </div>
  );
}

/**
 * Wrapper component that uses route params as key to force remount on navigation.
 * Reading mode and psalm quote are managed here to persist across chapter navigation.
 */
function BibleReaderWrapper() {
  const params = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate();

  const versionId = params.version;
  const bookId = parseInt(params.book, 10);
  const chapter = parseInt(params.chapter, 10);
  const key = `${versionId}-${bookId}-${chapter}`;

  // Reading mode from URL search params - managed at wrapper level to persist across navigation
  const readingMode = search.fullscreen ?? false;

  // Psalm quote persists across navigation (only changes on full page load)
  // Use first quote for SSR, then randomize on client to avoid hydration mismatch
  const [psalmQuote, setPsalmQuote] = useState<PsalmQuote>(PSALM_QUOTES[0]);

  useEffect(() => {
    setPsalmQuote(getRandomPsalmQuote());
  }, []);

  const setReadingMode = useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      const newValue = typeof value === "function" ? value(readingMode) : value;
      navigate({
        to: ".",
        search: (prev) => ({
          ...prev,
          fullscreen: newValue || undefined,
        }),
        replace: true,
      });
    },
    [navigate, readingMode],
  );

  return (
    <BibleReaderRoute
      key={key}
      versionId={versionId}
      bookId={bookId}
      chapter={chapter}
      readingMode={readingMode}
      setReadingMode={setReadingMode}
      psalmQuote={psalmQuote}
    />
  );
}
