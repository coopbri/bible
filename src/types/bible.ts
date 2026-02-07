export interface BibleVersion {
  id: string;
  code: string;
  name: string;
  language: string;
  description: string | null;
  is_default: boolean;
}

export interface BibleBook {
  id: number;
  book_number: number;
  name: string;
  testament: "OT" | "NT" | "DC";
  chapters: number;
}

export interface BibleVerse {
  id: string;
  version_id: string;
  book_id: number;
  chapter: number;
  verse: number;
  text: string;
  is_holy_words?: boolean;
}
