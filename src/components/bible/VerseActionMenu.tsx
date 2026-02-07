import {
  Bookmark,
  ChevronRight,
  Eraser,
  Highlighter,
  MoreVertical,
  Share2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { ReactNode } from "react";
import type { BibleVerse } from "@/lib/bibleApi";

/** Preset highlight colors. */
const HIGHLIGHT_COLORS = [
  { name: "Yellow", value: "#fef08a" },
  { name: "Green", value: "#bbf7d0" },
  { name: "Blue", value: "#bfdbfe" },
  { name: "Pink", value: "#fbcfe8" },
  { name: "Orange", value: "#fed7aa" },
  { name: "Purple", value: "#ddd6fe" },
] as const;

interface VerseActionMenuProps {
  verse: BibleVerse;
  isBookmarked: boolean;
  highlightColor: string | undefined;
  onToggleBookmark: (verse: BibleVerse) => void;
  onShareVerse: (verse: BibleVerse) => void;
  onHighlightVerse: (verse: BibleVerse, color: string) => void;
  onRemoveHighlight: (verse: BibleVerse) => void;
  children: ReactNode;
}

/**
 * Color swatch button for highlight selection.
 */
const ColorSwatch = ({
  color,
  name,
  isActive,
  onClick,
}: {
  color: string;
  name: string;
  isActive: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ${
      isActive
        ? "border-foreground ring-2 ring-ring ring-offset-1 ring-offset-background"
        : "border-transparent"
    }`}
    style={{ backgroundColor: color }}
    onClick={onClick}
    title={name}
  />
);

interface MenuItemsProps {
  verse: BibleVerse;
  isBookmarked: boolean;
  highlightColor: string | undefined;
  onToggleBookmark: (verse: BibleVerse) => void;
  onShareVerse: (verse: BibleVerse) => void;
  onHighlightVerse: (verse: BibleVerse, color: string) => void;
  onRemoveHighlight: (verse: BibleVerse) => void;
  ItemComponent: React.ComponentType<{
    onClick?: () => void;
    children: ReactNode;
    className?: string;
  }>;
  SeparatorComponent: React.ComponentType;
  SubComponent: React.ComponentType<{ children: ReactNode }>;
  SubTriggerComponent: React.ComponentType<{
    children: ReactNode;
    className?: string;
  }>;
  SubContentComponent: React.ComponentType<{
    children: ReactNode;
    className?: string;
  }>;
}

/**
 * Shared menu items used by both context menu and dropdown menu.
 */
const MenuItems = ({
  verse,
  isBookmarked,
  highlightColor,
  onToggleBookmark,
  onShareVerse,
  onHighlightVerse,
  onRemoveHighlight,
  ItemComponent,
  SeparatorComponent,
  SubComponent,
  SubTriggerComponent,
  SubContentComponent,
}: MenuItemsProps) => (
  <>
    <ItemComponent onClick={() => onToggleBookmark(verse)}>
      <Bookmark
        className={`h-4 w-4 ${isBookmarked ? "fill-current text-primary" : ""}`}
      />
      {isBookmarked ? "Remove Bookmark" : "Bookmark"}
    </ItemComponent>
    <ItemComponent onClick={() => onShareVerse(verse)}>
      <Share2 className="h-4 w-4" />
      Share Verse
    </ItemComponent>
    <SeparatorComponent />
    <SubComponent>
      <SubTriggerComponent>
        <Highlighter className="h-4 w-4" />
        Highlight
        <ChevronRight className="ml-auto h-4 w-4" />
      </SubTriggerComponent>
      <SubContentComponent className="p-2">
        <div className="flex gap-1.5">
          {HIGHLIGHT_COLORS.map((c) => (
            <ColorSwatch
              key={c.value}
              color={c.value}
              name={c.name}
              isActive={highlightColor === c.value}
              onClick={() => onHighlightVerse(verse, c.value)}
            />
          ))}
        </div>
      </SubContentComponent>
    </SubComponent>
    {highlightColor && (
      <ItemComponent onClick={() => onRemoveHighlight(verse)}>
        <Eraser className="h-4 w-4" />
        Remove Highlight
      </ItemComponent>
    )}
  </>
);

/**
 * Verse action menu with context menu (desktop) and dropdown (mobile).
 */
const VerseActionMenu = ({ children, ...props }: VerseActionMenuProps) => (
  <ContextMenu>
    <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
    <ContextMenuContent>
      <MenuItems
        {...props}
        ItemComponent={ContextMenuItem}
        SeparatorComponent={ContextMenuSeparator}
        SubComponent={ContextMenuSub}
        SubTriggerComponent={ContextMenuSubTrigger}
        SubContentComponent={ContextMenuSubContent}
      />
    </ContextMenuContent>
  </ContextMenu>
);

/**
 * Three-dot dropdown trigger for mobile.
 */
export const VerseDropdownMenu = (
  props: Omit<VerseActionMenuProps, "children">,
) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 opacity-40 transition-opacity hover:opacity-100 active:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
      >
        <MoreVertical className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <MenuItems
        {...props}
        ItemComponent={DropdownMenuItem}
        SeparatorComponent={DropdownMenuSeparator}
        SubComponent={DropdownMenuSub}
        SubTriggerComponent={DropdownMenuSubTrigger}
        SubContentComponent={DropdownMenuSubContent}
      />
    </DropdownMenuContent>
  </DropdownMenu>
);

export default VerseActionMenu;
