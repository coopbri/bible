import { isHolyWordsVerse } from "@/data/holyWords";
import {
  areCollectionsInitialized,
  getChapterCacheCollection,
} from "@/lib/db/collections";

import type { BibleBook, BibleVerse, BibleVersion } from "@/types/bible";

export type { BibleBook, BibleVersion, BibleVerse };

const BIBLE_API_BASE = "https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles";

/**
 * Map book number to book name for the external API.
 */
const BOOK_NAMES: Record<number, string> = {
  1: "genesis",
  2: "exodus",
  3: "leviticus",
  4: "numbers",
  5: "deuteronomy",
  6: "joshua",
  7: "judges",
  8: "ruth",
  9: "1samuel",
  10: "2samuel",
  11: "1kings",
  12: "2kings",
  13: "1chronicles",
  14: "2chronicles",
  15: "ezra",
  16: "nehemiah",
  17: "esther",
  18: "job",
  19: "psalms",
  20: "proverbs",
  21: "ecclesiastes",
  22: "songofsolomon",
  23: "isaiah",
  24: "jeremiah",
  25: "lamentations",
  26: "ezekiel",
  27: "daniel",
  28: "hosea",
  29: "joel",
  30: "amos",
  31: "obadiah",
  32: "jonah",
  33: "micah",
  34: "nahum",
  35: "habakkuk",
  36: "zephaniah",
  37: "haggai",
  38: "zechariah",
  39: "malachi",
  40: "matthew",
  41: "mark",
  42: "luke",
  43: "john",
  44: "acts",
  45: "romans",
  46: "1corinthians",
  47: "2corinthians",
  48: "galatians",
  49: "ephesians",
  50: "philippians",
  51: "colossians",
  52: "1thessalonians",
  53: "2thessalonians",
  54: "1timothy",
  55: "2timothy",
  56: "titus",
  57: "philemon",
  58: "hebrews",
  59: "james",
  60: "1peter",
  61: "2peter",
  62: "1john",
  63: "2john",
  64: "3john",
  65: "jude",
  66: "revelation",
  67: "tobit",
  68: "judith",
  69: "wisdomofsolomon",
  70: "sirach",
  71: "baruch",
  72: "1maccabees",
  73: "2maccabees",
  74: "1esdras",
  75: "2esdras",
  76: "prayerofmanasses",
  77: "belandthedragon",
  78: "susanna",
  79: "songofthethree",
  80: "3maccabees",
  81: "4maccabees",
};

/**
 * Per-version overrides for book API path names.
 */
const BOOK_NAME_OVERRIDES: Record<string, Record<number, string>> = {
  kjv: { 69: "wisdom", 70: "ecclesiasticus", 76: "manasseh" },
};

/**
 * Get the API path name for a book, respecting per-version overrides.
 */
const getBookApiName = (
  bookId: number,
  versionId: string,
): string | undefined =>
  BOOK_NAME_OVERRIDES[versionId]?.[bookId] ?? BOOK_NAMES[bookId];

/**
 * Available Bible versions from the external API.
 * IDs are short codes used in routes (e.g., /kjv/1/1).
 */
const AVAILABLE_VERSIONS: BibleVersion[] = [
  {
    id: "kjv",
    code: "KJV",
    name: "King James Version",
    language: "en",
    description: "The King James Version (1611)",
    is_default: true,
  },
  {
    id: "asv",
    code: "ASV",
    name: "American Standard Version",
    language: "en",
    description: "American Standard Version (1901)",
    is_default: false,
  },
  {
    id: "web",
    code: "WEB",
    name: "World English Bible",
    language: "en",
    description: "World English Bible (American Edition)",
    is_default: false,
  },
  {
    id: "bsb",
    code: "BSB",
    name: "Berean Study Bible",
    language: "en",
    description: "Berean Study Bible",
    is_default: false,
  },
  {
    id: "lsv",
    code: "LSV",
    name: "Literal Standard Version",
    language: "en",
    description: "Literal Standard Version",
    is_default: false,
  },
  {
    id: "dra",
    code: "DRA",
    name: "Douay-Rheims",
    language: "en",
    description: "Douay-Rheims American 1899",
    is_default: false,
  },
  {
    id: "rv",
    code: "RV",
    name: "Revised Version",
    language: "en",
    description: "Revised Version (1885)",
    is_default: false,
  },
  {
    id: "gnv",
    code: "GNV",
    name: "Geneva Bible",
    language: "en",
    description: "Geneva Bible (1599)",
    is_default: false,
  },
  {
    id: "fbv",
    code: "FBV",
    name: "Free Bible Version",
    language: "en",
    description: "Free Bible Version (Modern English)",
    is_default: false,
  },
  {
    id: "t4t",
    code: "T4T",
    name: "Translation for Translators",
    language: "en",
    description: "Makes implicit meaning explicit",
    is_default: false,
  },
  {
    id: "wmb",
    code: "WMB",
    name: "World Messianic Bible",
    language: "en",
    description: "Messianic Jewish perspective",
    is_default: false,
  },
];

/**
 * Map short version ID to API path.
 * The external API uses "en-{version}" format.
 */
const getApiVersionId = (versionId: string): string => {
  // If already has language prefix, use as-is
  if (versionId.includes("-")) return versionId;
  // Otherwise, add "en-" prefix for English versions
  return `en-${versionId}`;
};

/**
 * Standard Bible books data.
 */
const BIBLE_BOOKS: BibleBook[] = [
  { id: 1, book_number: 1, name: "Genesis", testament: "OT", chapters: 50 },
  { id: 2, book_number: 2, name: "Exodus", testament: "OT", chapters: 40 },
  { id: 3, book_number: 3, name: "Leviticus", testament: "OT", chapters: 27 },
  { id: 4, book_number: 4, name: "Numbers", testament: "OT", chapters: 36 },
  { id: 5, book_number: 5, name: "Deuteronomy", testament: "OT", chapters: 34 },
  { id: 6, book_number: 6, name: "Joshua", testament: "OT", chapters: 24 },
  { id: 7, book_number: 7, name: "Judges", testament: "OT", chapters: 21 },
  { id: 8, book_number: 8, name: "Ruth", testament: "OT", chapters: 4 },
  { id: 9, book_number: 9, name: "1 Samuel", testament: "OT", chapters: 31 },
  { id: 10, book_number: 10, name: "2 Samuel", testament: "OT", chapters: 24 },
  { id: 11, book_number: 11, name: "1 Kings", testament: "OT", chapters: 22 },
  { id: 12, book_number: 12, name: "2 Kings", testament: "OT", chapters: 25 },
  {
    id: 13,
    book_number: 13,
    name: "1 Chronicles",
    testament: "OT",
    chapters: 29,
  },
  {
    id: 14,
    book_number: 14,
    name: "2 Chronicles",
    testament: "OT",
    chapters: 36,
  },
  { id: 15, book_number: 15, name: "Ezra", testament: "OT", chapters: 10 },
  { id: 16, book_number: 16, name: "Nehemiah", testament: "OT", chapters: 13 },
  { id: 17, book_number: 17, name: "Esther", testament: "OT", chapters: 10 },
  { id: 18, book_number: 18, name: "Job", testament: "OT", chapters: 42 },
  { id: 19, book_number: 19, name: "Psalms", testament: "OT", chapters: 150 },
  { id: 20, book_number: 20, name: "Proverbs", testament: "OT", chapters: 31 },
  {
    id: 21,
    book_number: 21,
    name: "Ecclesiastes",
    testament: "OT",
    chapters: 12,
  },
  {
    id: 22,
    book_number: 22,
    name: "Song of Solomon",
    testament: "OT",
    chapters: 8,
  },
  { id: 23, book_number: 23, name: "Isaiah", testament: "OT", chapters: 66 },
  { id: 24, book_number: 24, name: "Jeremiah", testament: "OT", chapters: 52 },
  {
    id: 25,
    book_number: 25,
    name: "Lamentations",
    testament: "OT",
    chapters: 5,
  },
  { id: 26, book_number: 26, name: "Ezekiel", testament: "OT", chapters: 48 },
  { id: 27, book_number: 27, name: "Daniel", testament: "OT", chapters: 12 },
  { id: 28, book_number: 28, name: "Hosea", testament: "OT", chapters: 14 },
  { id: 29, book_number: 29, name: "Joel", testament: "OT", chapters: 3 },
  { id: 30, book_number: 30, name: "Amos", testament: "OT", chapters: 9 },
  { id: 31, book_number: 31, name: "Obadiah", testament: "OT", chapters: 1 },
  { id: 32, book_number: 32, name: "Jonah", testament: "OT", chapters: 4 },
  { id: 33, book_number: 33, name: "Micah", testament: "OT", chapters: 7 },
  { id: 34, book_number: 34, name: "Nahum", testament: "OT", chapters: 3 },
  { id: 35, book_number: 35, name: "Habakkuk", testament: "OT", chapters: 3 },
  { id: 36, book_number: 36, name: "Zephaniah", testament: "OT", chapters: 3 },
  { id: 37, book_number: 37, name: "Haggai", testament: "OT", chapters: 2 },
  { id: 38, book_number: 38, name: "Zechariah", testament: "OT", chapters: 14 },
  { id: 39, book_number: 39, name: "Malachi", testament: "OT", chapters: 4 },
  { id: 40, book_number: 40, name: "Matthew", testament: "NT", chapters: 28 },
  { id: 41, book_number: 41, name: "Mark", testament: "NT", chapters: 16 },
  { id: 42, book_number: 42, name: "Luke", testament: "NT", chapters: 24 },
  { id: 43, book_number: 43, name: "John", testament: "NT", chapters: 21 },
  { id: 44, book_number: 44, name: "Acts", testament: "NT", chapters: 28 },
  { id: 45, book_number: 45, name: "Romans", testament: "NT", chapters: 16 },
  {
    id: 46,
    book_number: 46,
    name: "1 Corinthians",
    testament: "NT",
    chapters: 16,
  },
  {
    id: 47,
    book_number: 47,
    name: "2 Corinthians",
    testament: "NT",
    chapters: 13,
  },
  { id: 48, book_number: 48, name: "Galatians", testament: "NT", chapters: 6 },
  { id: 49, book_number: 49, name: "Ephesians", testament: "NT", chapters: 6 },
  {
    id: 50,
    book_number: 50,
    name: "Philippians",
    testament: "NT",
    chapters: 4,
  },
  { id: 51, book_number: 51, name: "Colossians", testament: "NT", chapters: 4 },
  {
    id: 52,
    book_number: 52,
    name: "1 Thessalonians",
    testament: "NT",
    chapters: 5,
  },
  {
    id: 53,
    book_number: 53,
    name: "2 Thessalonians",
    testament: "NT",
    chapters: 3,
  },
  { id: 54, book_number: 54, name: "1 Timothy", testament: "NT", chapters: 6 },
  { id: 55, book_number: 55, name: "2 Timothy", testament: "NT", chapters: 4 },
  { id: 56, book_number: 56, name: "Titus", testament: "NT", chapters: 3 },
  { id: 57, book_number: 57, name: "Philemon", testament: "NT", chapters: 1 },
  { id: 58, book_number: 58, name: "Hebrews", testament: "NT", chapters: 13 },
  { id: 59, book_number: 59, name: "James", testament: "NT", chapters: 5 },
  { id: 60, book_number: 60, name: "1 Peter", testament: "NT", chapters: 5 },
  { id: 61, book_number: 61, name: "2 Peter", testament: "NT", chapters: 3 },
  { id: 62, book_number: 62, name: "1 John", testament: "NT", chapters: 5 },
  { id: 63, book_number: 63, name: "2 John", testament: "NT", chapters: 1 },
  { id: 64, book_number: 64, name: "3 John", testament: "NT", chapters: 1 },
  { id: 65, book_number: 65, name: "Jude", testament: "NT", chapters: 1 },
  {
    id: 66,
    book_number: 66,
    name: "Revelation",
    testament: "NT",
    chapters: 22,
  },
  { id: 67, book_number: 67, name: "Tobit", testament: "DC", chapters: 14 },
  { id: 68, book_number: 68, name: "Judith", testament: "DC", chapters: 16 },
  {
    id: 69,
    book_number: 69,
    name: "Wisdom of Solomon",
    testament: "DC",
    chapters: 19,
  },
  { id: 70, book_number: 70, name: "Sirach", testament: "DC", chapters: 51 },
  { id: 71, book_number: 71, name: "Baruch", testament: "DC", chapters: 6 },
  {
    id: 72,
    book_number: 72,
    name: "1 Maccabees",
    testament: "DC",
    chapters: 16,
  },
  {
    id: 73,
    book_number: 73,
    name: "2 Maccabees",
    testament: "DC",
    chapters: 15,
  },
  { id: 74, book_number: 74, name: "1 Esdras", testament: "DC", chapters: 9 },
  {
    id: 75,
    book_number: 75,
    name: "2 Esdras",
    testament: "DC",
    chapters: 16,
  },
  {
    id: 76,
    book_number: 76,
    name: "Prayer of Manasseh",
    testament: "DC",
    chapters: 1,
  },
  {
    id: 77,
    book_number: 77,
    name: "Bel and the Dragon",
    testament: "DC",
    chapters: 1,
  },
  { id: 78, book_number: 78, name: "Susanna", testament: "DC", chapters: 1 },
  {
    id: 79,
    book_number: 79,
    name: "Song of the Three",
    testament: "DC",
    chapters: 1,
  },
  {
    id: 80,
    book_number: 80,
    name: "3 Maccabees",
    testament: "DC",
    chapters: 7,
  },
  {
    id: 81,
    book_number: 81,
    name: "4 Maccabees",
    testament: "DC",
    chapters: 9,
  },
];

/**
 * DC book IDs available per version.
 */
const DC_BOOKS_BY_VERSION: Record<string, number[]> = {
  dra: [67, 68, 69, 70, 72, 73],
  kjv: [67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79],
  web: [67, 68, 69, 70, 72, 73, 74, 75, 76, 80, 81],
};

/**
 * Get books available for a specific version (canonical + DC if supported).
 */
const getBooksForVersion = (versionId: string): BibleBook[] => {
  const dcBookIds = DC_BOOKS_BY_VERSION[versionId];
  if (!dcBookIds) {
    return BIBLE_BOOKS.filter((b) => b.testament !== "DC");
  }
  return BIBLE_BOOKS.filter(
    (b) => b.testament !== "DC" || dcBookIds.includes(b.id),
  );
};

interface ExternalApiVerse {
  book: string;
  chapter: string;
  verse: string;
  text: string;
}

interface ExternalApiResponse {
  data: ExternalApiVerse[];
}

/**
 * Get cache key for a chapter.
 */
const getCacheKey = (versionId: string, bookId: number, chapter: number) =>
  `${versionId}-${bookId}-${chapter}`;

/**
 * Get cached chapter from TanStack DB.
 */
const getCachedChapter = (
  versionId: string,
  bookId: number,
  chapter: number,
): BibleVerse[] | null => {
  if (typeof window === "undefined" || !areCollectionsInitialized())
    return null;

  const cacheKey = getCacheKey(versionId, bookId, chapter);
  const collection = getChapterCacheCollection();
  const cached = collection.state.get(cacheKey);

  return cached?.verses || null;
};

/**
 * Cache chapter to TanStack DB.
 */
const cacheChapter = (
  versionId: string,
  bookId: number,
  chapter: number,
  verses: BibleVerse[],
): void => {
  if (typeof window === "undefined" || !areCollectionsInitialized()) return;

  const cacheKey = getCacheKey(versionId, bookId, chapter);
  const collection = getChapterCacheCollection();

  const cacheEntry = {
    id: cacheKey,
    versionId,
    bookId,
    chapter,
    verses,
    cachedAt: new Date().toISOString(),
  };

  if (collection.state.has(cacheKey)) {
    collection.update([cacheKey], (drafts) => {
      const draft = drafts[0];
      if (draft) {
        draft.verses = verses;
        draft.cachedAt = cacheEntry.cachedAt;
      }
    });
  } else {
    collection.insert(cacheEntry);
  }
};

/**
 * Fetch chapter from API (without caching).
 */
const fetchChapterFromApi = async (
  versionId: string,
  bookId: number,
  chapter: number,
): Promise<BibleVerse[]> => {
  const bookName = getBookApiName(bookId, versionId);
  if (!bookName) {
    console.error(`Unknown book number: ${bookId}`);
    return [];
  }

  const apiVersionId = getApiVersionId(versionId);
  const url = `${BIBLE_API_BASE}/${apiVersionId}/books/${bookName}/chapters/${chapter}.json`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`Failed to fetch chapter: ${response.status}`);
      return [];
    }

    const apiData: ExternalApiResponse = await response.json();

    return apiData.data.map((v, index) => {
      const verseNum = parseInt(v.verse, 10);
      return {
        id: `${versionId}-${bookId}-${chapter}-${v.verse}-${index}`,
        version_id: versionId,
        book_id: bookId,
        chapter,
        verse: verseNum,
        text: v.text,
        is_holy_words: isHolyWordsVerse(bookId, chapter, verseNum),
      };
    });
  } catch (error) {
    console.error("Failed to fetch chapter:", error);
    return [];
  }
};

export const bibleApi = {
  getVersions(): BibleVersion[] {
    return [...AVAILABLE_VERSIONS].sort((a, b) => a.name.localeCompare(b.name));
  },

  getBooks(): BibleBook[] {
    return BIBLE_BOOKS;
  },

  getBooksForVersion(versionId: string): BibleBook[] {
    return getBooksForVersion(versionId);
  },

  async getChapter(
    versionId: string,
    bookId: number | string,
    chapter: number,
  ): Promise<BibleVerse[]> {
    const bookNum = typeof bookId === "string" ? parseInt(bookId, 10) : bookId;

    // Try cache first
    const cached = getCachedChapter(versionId, bookNum, chapter);
    if (cached) return cached;

    // Fetch from API
    const verses = await fetchChapterFromApi(versionId, bookNum, chapter);

    // Cache the result
    if (verses.length > 0) {
      cacheChapter(versionId, bookNum, chapter, verses);
    }

    return verses;
  },

  getBookById(bookId: number | string): BibleBook | null {
    const bookNum = typeof bookId === "string" ? parseInt(bookId, 10) : bookId;
    return (
      BIBLE_BOOKS.find((b) => b.id === bookNum || b.book_number === bookNum) ??
      null
    );
  },

  /**
   * Preload adjacent chapters for faster navigation.
   */
  preloadAdjacentChapters(
    versionId: string,
    bookId: number,
    chapter: number,
  ): void {
    if (typeof window === "undefined") return;

    const book = this.getBookById(bookId);
    if (!book) return;

    const chaptersToPreload: Array<{ bookId: number; chapter: number }> = [];

    // Previous chapter
    if (chapter > 1) {
      chaptersToPreload.push({ bookId, chapter: chapter - 1 });
    } else if (bookId > 1) {
      const prevBook = this.getBookById(bookId - 1);
      if (prevBook) {
        chaptersToPreload.push({
          bookId: prevBook.id,
          chapter: prevBook.chapters,
        });
      }
    }

    // Next chapter
    if (chapter < book.chapters) {
      chaptersToPreload.push({ bookId, chapter: chapter + 1 });
    } else {
      const versionBooks = getBooksForVersion(versionId);
      const currentIndex = versionBooks.findIndex((b) => b.id === bookId);
      if (currentIndex >= 0 && currentIndex < versionBooks.length - 1) {
        chaptersToPreload.push({
          bookId: versionBooks[currentIndex + 1].id,
          chapter: 1,
        });
      }
    }

    // Preload in background
    for (const {
      bookId: preloadBookId,
      chapter: preloadChapter,
    } of chaptersToPreload) {
      const cached = getCachedChapter(versionId, preloadBookId, preloadChapter);
      if (!cached) {
        fetchChapterFromApi(versionId, preloadBookId, preloadChapter).then(
          (verses) => {
            if (verses.length > 0) {
              cacheChapter(versionId, preloadBookId, preloadChapter, verses);
            }
          },
        );
      }
    }
  },

  clearCache(): void {
    if (typeof window === "undefined" || !areCollectionsInitialized()) return;

    const collection = getChapterCacheCollection();
    const keys = Array.from(collection.state.keys());
    for (const key of keys) {
      collection.delete(key);
    }
  },
};
