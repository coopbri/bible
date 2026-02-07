import {
  areCollectionsInitialized,
  getHighlightsCollection,
  getUserId,
} from "@/lib/db/collections";

import type { Highlight } from "@/types/highlights";

export type { Highlight };

export const highlightsService = {
  getHighlights(): Highlight[] {
    if (typeof window === "undefined" || !areCollectionsInitialized())
      return [];

    const userId = getUserId();
    const collection = getHighlightsCollection();
    const allHighlights = Array.from(collection.state.values());

    return allHighlights
      .filter((h) => h.user_id === userId)
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
  },

  addHighlight(
    versionId: string,
    bookId: number | string,
    chapter: number,
    verse: number,
    color: string,
  ): Highlight {
    const userId = getUserId();
    const bookNum = typeof bookId === "string" ? parseInt(bookId, 10) : bookId;

    const existing = this.getHighlight(versionId, bookNum, chapter, verse);
    if (existing) {
      return this.updateHighlight(existing.id, { color }) ?? existing;
    }

    const now = new Date().toISOString();
    const highlight: Highlight = {
      id: crypto.randomUUID(),
      user_id: userId,
      version_id: versionId,
      book_id: bookNum,
      chapter,
      verse,
      color,
      created_at: now,
      updated_at: now,
    };

    const collection = getHighlightsCollection();
    collection.insert(highlight);
    return highlight;
  },

  updateHighlight(id: string, updates: { color?: string }): Highlight | null {
    if (!areCollectionsInitialized()) return null;

    const userId = getUserId();
    const collection = getHighlightsCollection();
    const highlight = collection.state.get(id);

    if (!highlight || highlight.user_id !== userId) {
      return null;
    }

    const updated: Highlight = {
      ...highlight,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    collection.update([id], (drafts) => {
      const draft = drafts[0];
      if (draft) {
        if (updates.color !== undefined) draft.color = updates.color;
        draft.updated_at = updated.updated_at;
      }
    });
    return updated;
  },

  deleteHighlight(id: string): void {
    if (!areCollectionsInitialized()) return;

    const userId = getUserId();
    const collection = getHighlightsCollection();
    const highlight = collection.state.get(id);

    if (highlight && highlight.user_id === userId) {
      collection.delete(id);
    }
  },

  getHighlight(
    versionId: string,
    bookId: number | string,
    chapter: number,
    verse: number,
  ): Highlight | null {
    if (typeof window === "undefined" || !areCollectionsInitialized())
      return null;

    const userId = getUserId();
    const bookNum = typeof bookId === "string" ? parseInt(bookId, 10) : bookId;
    const collection = getHighlightsCollection();

    return (
      Array.from(collection.state.values()).find(
        (h) =>
          h.user_id === userId &&
          h.version_id === versionId &&
          h.book_id === bookNum &&
          h.chapter === chapter &&
          h.verse === verse,
      ) || null
    );
  },

  isHighlighted(
    versionId: string,
    bookId: number | string,
    chapter: number,
    verse: number,
  ): boolean {
    return this.getHighlight(versionId, bookId, chapter, verse) !== null;
  },

  getHighlightsForChapter(
    versionId: string,
    bookId: number | string,
    chapter: number,
  ): Map<number, Highlight> {
    if (typeof window === "undefined" || !areCollectionsInitialized())
      return new Map();

    const userId = getUserId();
    const bookNum = typeof bookId === "string" ? parseInt(bookId, 10) : bookId;
    const collection = getHighlightsCollection();
    const result = new Map<number, Highlight>();

    for (const h of collection.state.values()) {
      if (
        h.user_id === userId &&
        h.version_id === versionId &&
        h.book_id === bookNum &&
        h.chapter === chapter
      ) {
        result.set(h.verse, h);
      }
    }

    return result;
  },
};
