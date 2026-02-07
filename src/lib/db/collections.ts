import { createCollection, localStorageCollectionOptions } from "@tanstack/db";

import type { BibleVerse } from "@/types/bible";
import type { Bookmark } from "@/types/bookmarks";
import type { Highlight } from "@/types/highlights";

// Storage keys
const BOOKMARKS_KEY = "bible-bookmarks-db";
const HIGHLIGHTS_KEY = "bible-highlights-db";
const PREFERENCES_KEY = "bible-preferences-db";
const CHAPTER_CACHE_KEY = "bible-chapter-cache-db";
const USER_ID_KEY = "bible-user-id";

/**
 * User preferences stored in the database.
 */
export interface UserPreferences {
  id: string;
  selectedVersionId: string | null;
  selectedBookId: number | null;
  selectedChapter: number;
  scrollPosition: number;
  holyWordsEnabled: boolean;
  holyWordsColor: string;
  footerVerseEnabled: boolean;
  theme: "light" | "dark" | "system";
  lastUpdated: string;
}

/**
 * Bible chapter cache entry.
 */
export interface CachedChapter {
  id: string;
  versionId: string;
  bookId: number;
  chapter: number;
  verses: BibleVerse[];
  cachedAt: string;
}

/**
 * Get or create anonymous user ID.
 */
export function getUserId(): string {
  if (typeof window === "undefined") return "anon-server";

  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = `anon-${crypto.randomUUID()}`;
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
}

/**
 * Create bookmarks collection using localStorage.
 */
export function createBookmarksCollection() {
  return createCollection<Bookmark, string>(
    localStorageCollectionOptions({
      storageKey: BOOKMARKS_KEY,
      getKey: (item) => item.id,
    }),
  );
}

/**
 * Create highlights collection using localStorage.
 */
export function createHighlightsCollection() {
  return createCollection<Highlight, string>(
    localStorageCollectionOptions({
      storageKey: HIGHLIGHTS_KEY,
      getKey: (item) => item.id,
    }),
  );
}

/**
 * Create preferences collection using localStorage.
 */
export function createPreferencesCollection() {
  return createCollection<UserPreferences, string>(
    localStorageCollectionOptions({
      storageKey: PREFERENCES_KEY,
      getKey: (item) => item.id,
    }),
  );
}

/**
 * Create chapter cache collection using localStorage.
 */
export function createChapterCacheCollection() {
  return createCollection<CachedChapter, string>(
    localStorageCollectionOptions({
      storageKey: CHAPTER_CACHE_KEY,
      getKey: (item) => item.id,
    }),
  );
}

// Collection types
export type BookmarksCollection = ReturnType<typeof createBookmarksCollection>;
export type HighlightsCollection = ReturnType<
  typeof createHighlightsCollection
>;
export type PreferencesCollection = ReturnType<
  typeof createPreferencesCollection
>;
export type ChapterCacheCollection = ReturnType<
  typeof createChapterCacheCollection
>;

// Global collection instances
let bookmarksCollection: BookmarksCollection | null = null;
let highlightsCollection: HighlightsCollection | null = null;
let preferencesCollection: PreferencesCollection | null = null;
let chapterCacheCollection: ChapterCacheCollection | null = null;

// Event listeners for collections ready
type CollectionsReadyListener = () => void;
const collectionsReadyListeners: Set<CollectionsReadyListener> = new Set();
let collectionsReadyFired = false;

/**
 * Subscribe to be notified when collections are ready.
 * If collections are already ready, callback fires immediately.
 */
export function onCollectionsReady(
  callback: CollectionsReadyListener,
): () => void {
  if (collectionsReadyFired) {
    callback();
    return () => {};
  }
  collectionsReadyListeners.add(callback);
  return () => collectionsReadyListeners.delete(callback);
}

/**
 * Initialize all collections.
 * Must be called once at app startup.
 */
export async function initializeCollections(): Promise<void> {
  if (typeof window === "undefined") return;

  bookmarksCollection = createBookmarksCollection();
  highlightsCollection = createHighlightsCollection();
  preferencesCollection = createPreferencesCollection();
  chapterCacheCollection = createChapterCacheCollection();

  // Preload collections to trigger initial data fetch from localStorage
  await Promise.all([
    bookmarksCollection.preload(),
    highlightsCollection.preload(),
    preferencesCollection.preload(),
    chapterCacheCollection.preload(),
  ]);

  // Notify listeners that collections are ready
  collectionsReadyFired = true;
  for (const listener of collectionsReadyListeners) {
    listener();
  }
  collectionsReadyListeners.clear();
}

/**
 * Get the bookmarks collection.
 */
export function getBookmarksCollection(): BookmarksCollection {
  if (!bookmarksCollection) {
    throw new Error("Collections not initialized");
  }
  return bookmarksCollection;
}

/**
 * Get the highlights collection.
 */
export function getHighlightsCollection(): HighlightsCollection {
  if (!highlightsCollection) {
    throw new Error("Collections not initialized");
  }
  return highlightsCollection;
}

/**
 * Get the preferences collection.
 */
export function getPreferencesCollection(): PreferencesCollection {
  if (!preferencesCollection) {
    throw new Error("Collections not initialized");
  }
  return preferencesCollection;
}

/**
 * Get the chapter cache collection.
 */
export function getChapterCacheCollection(): ChapterCacheCollection {
  if (!chapterCacheCollection) {
    throw new Error("Collections not initialized");
  }
  return chapterCacheCollection;
}

/**
 * Check if collections are initialized.
 */
export function areCollectionsInitialized(): boolean {
  return bookmarksCollection !== null;
}
