import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { BibleBook } from "@/lib/bibleApi";

interface BookChapterSelectorProps {
  books: BibleBook[] | undefined;
  selectedBookId: number | null;
  selectedChapter: number;
  onBookChange: (bookId: number) => void;
  onChapterChange: (chapter: number) => void;
  currentBook: BibleBook | undefined;
}

/**
 * Dropdown selectors for choosing a Bible book and chapter.
 */
const BookChapterSelector = ({
  books,
  selectedBookId,
  selectedChapter,
  onBookChange,
  onChapterChange,
  currentBook,
}: BookChapterSelectorProps) => (
  <div className="mb-2 flex gap-2 sm:mb-4 sm:gap-4">
    <div className="min-w-0 flex-2">
      <span className="mb-1 block font-semibold text-primary-foreground text-xs uppercase tracking-wider sm:mb-2">
        Book
      </span>
      <Select
        value={selectedBookId?.toString() || ""}
        onValueChange={(value) => {
          onBookChange(parseInt(value, 10));
        }}
      >
        <SelectTrigger className="bg-background">
          <SelectValue placeholder="Book" />
        </SelectTrigger>
        <SelectContent>
          {(books?.filter((b: BibleBook) => b.testament === "OT").length ?? 0) >
            0 && (
            <>
              <div className="px-2 py-1.5 font-bold font-serif text-primary text-sm">
                Old Testament
              </div>
              {books
                ?.filter((b: BibleBook) => b.testament === "OT")
                .map((book: BibleBook) => (
                  <SelectItem key={book.id} value={book.id.toString()}>
                    {book.name}
                  </SelectItem>
                ))}
            </>
          )}
          {(books?.filter((b: BibleBook) => b.testament === "NT").length ?? 0) >
            0 && (
            <>
              <div className="mt-2 px-2 py-1.5 font-bold font-serif text-primary text-sm">
                New Testament
              </div>
              {books
                ?.filter((b: BibleBook) => b.testament === "NT")
                .map((book: BibleBook) => (
                  <SelectItem key={book.id} value={book.id.toString()}>
                    {book.name}
                  </SelectItem>
                ))}
            </>
          )}
          {(books?.filter((b: BibleBook) => b.testament === "DC").length ?? 0) >
            0 && (
            <>
              <div className="mt-2 px-2 py-1.5 font-bold font-serif text-primary text-sm">
                Deuterocanon
              </div>
              {books
                ?.filter((b: BibleBook) => b.testament === "DC")
                .map((book: BibleBook) => (
                  <SelectItem key={book.id} value={book.id.toString()}>
                    {book.name}
                  </SelectItem>
                ))}
            </>
          )}
        </SelectContent>
      </Select>
    </div>

    <div className="min-w-0 flex-1">
      <span className="mb-1 block font-semibold text-primary-foreground text-xs uppercase tracking-wider sm:mb-2">
        Chapter
      </span>
      <Select
        value={selectedChapter.toString()}
        onValueChange={(value) => {
          onChapterChange(parseInt(value, 10));
        }}
      >
        <SelectTrigger className="bg-background">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {currentBook &&
            Array.from({ length: currentBook.chapters }, (_, i) => i + 1).map(
              (chapter) => (
                <SelectItem key={chapter} value={chapter.toString()}>
                  {chapter}
                </SelectItem>
              ),
            )}
        </SelectContent>
      </Select>
    </div>
  </div>
);

export default BookChapterSelector;
