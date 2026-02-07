import app from "@/lib/config/app.config";

interface ShareVerseOptions {
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
  versionCode: string;
  versionId: string;
  bookId: number;
}

/**
 * Build a shareable URL for a verse.
 */
const buildVerseUrl = (
  versionId: string,
  bookId: number,
  chapter: number,
  verse: number,
): string => `${app.url}/${versionId}/${bookId}/${chapter}?v=${verse}`;

/**
 * Share a verse using the Web Share API or clipboard fallback.
 * @returns `"shared"` if Web Share API was used, `"copied"` if clipboard fallback was used.
 */
export const shareVerse = async (
  opts: ShareVerseOptions,
): Promise<"shared" | "copied"> => {
  const url = buildVerseUrl(
    opts.versionId,
    opts.bookId,
    opts.chapter,
    opts.verse,
  );
  const shareText = `"${opts.text}"\n\n${opts.bookName} ${opts.chapter}:${opts.verse} (${opts.versionCode})`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: `${opts.bookName} ${opts.chapter}:${opts.verse} (${opts.versionCode})`,
        text: shareText,
        url,
      });
      return "shared";
    } catch (error) {
      // User cancelled or share failed — fall through to clipboard
      if (error instanceof Error && error.name === "AbortError") {
        return "shared";
      }
    }
  }

  await navigator.clipboard.writeText(`${shareText}\n${url}`);
  return "copied";
};
