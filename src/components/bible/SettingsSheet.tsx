import { Debouncer } from "@tanstack/pacer";
import {
  Bookmark,
  Download,
  Github,
  Heart,
  MessageSquare,
  Settings,
  Upload,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import app from "@/lib/config/app.config";
import { userPreferencesService } from "@/lib/userPreferences";
import { cn } from "@/lib/utils";
import { palettes, useTheme } from "@/providers/ThemeProvider";

import type { BibleVersion } from "@/lib/bibleApi";
import type { ColorPalette } from "@/server/functions/theme";

const COLOR_PRESETS = [
  { name: "Classic Red", value: "#dc2626" },
  { name: "Dark Red", value: "#b91c1c" },
  { name: "Rose", value: "#e11d48" },
  { name: "Orange", value: "#ea580c" },
  { name: "Amber", value: "#d97706" },
  { name: "Purple", value: "#9333ea" },
  { name: "Blue", value: "#2563eb" },
];

const PALETTE_COLORS: Record<ColorPalette, string> = {
  sage: "#3d7a5c",
  ocean: "#2563eb",
  canyon: "#d4694a",
  violet: "#7c3aed",
  mesa: "#e07830",
  juniper: "#3d8a7a",
  rose: "#e11d48",
  custom: "#888888",
};

interface SettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  versions: BibleVersion[] | undefined;
  selectedVersionId: string | null;
  onVersionChange: (versionId: string) => void;
  holyWordsEnabled: boolean;
  onHolyWordsEnabledChange: (enabled: boolean) => void;
  holyWordsColor: string;
  onHolyWordsColorChange: (color: string) => void;
}

/**
 * Settings sheet for managing Bible versions, preferences, and app settings.
 */
const SettingsSheet = ({
  open,
  onOpenChange,
  versions,
  selectedVersionId,
  onVersionChange,
  holyWordsEnabled,
  onHolyWordsEnabledChange,
  holyWordsColor,
  onHolyWordsColorChange,
}: SettingsSheetProps) => {
  const {
    palette,
    mode,
    setPalette,
    setMode,
    customColor,
    setCustomColor,
    footerVerseEnabled,
    setFooterVerseEnabled,
  } = useTheme();
  const [localCustomColor, setLocalCustomColor] = useState(
    customColor || "#3d7a5c",
  );

  const debouncedSetCustomColor = useMemo(
    () => new Debouncer(setCustomColor, { wait: 150 }),
    [setCustomColor],
  );

  const handleCustomColorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const color = e.target.value;
      setLocalCustomColor(color);
      debouncedSetCustomColor.maybeExecute(color);
    },
    [debouncedSetCustomColor],
  );

  const [localHolyWordsColor, setLocalHolyWordsColor] =
    useState(holyWordsColor);

  const debouncedSetHolyWordsColor = useMemo(
    () => new Debouncer(onHolyWordsColorChange, { wait: 150 }),
    [onHolyWordsColorChange],
  );

  const handleHolyWordsColorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const color = e.target.value;
      setLocalHolyWordsColor(color);
      debouncedSetHolyWordsColor.maybeExecute(color);
    },
    [debouncedSetHolyWordsColor],
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="bg-card/80 backdrop-blur-sm"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col bg-card px-0! sm:max-w-md">
        <SheetHeader className="shrink-0 px-6">
          <SheetTitle className="font-serif">Settings</SheetTitle>
          <SheetDescription>
            Manage Bible versions and preferences
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 flex-1 space-y-4 overflow-y-auto px-6 pb-6 sm:mt-6">
          <div className="space-y-2">
            <span className="font-semibold text-foreground text-sm">
              Bible Version
            </span>
            <Select
              value={selectedVersionId || ""}
              onValueChange={onVersionChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select version" />
              </SelectTrigger>
              <SelectContent>
                {versions?.map((version: BibleVersion) => (
                  <SelectItem key={version.id} value={version.id}>
                    {version.name} ({version.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <span className="font-semibold text-foreground text-sm">
              Language
            </span>
            <Select value="en" disabled>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-muted-foreground text-xs">
              More languages and side-by-side comparison coming soon.
            </p>
          </div>

          <div className="space-y-2">
            <span className="font-semibold text-foreground text-sm">
              Color Theme
            </span>
            <div className="flex flex-wrap gap-2">
              {palettes.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPalette(p.value)}
                  className={cn(
                    "h-8 w-8 cursor-pointer rounded-full border-2 transition-all hover:scale-110",
                    palette === p.value
                      ? "border-foreground ring-2 ring-foreground ring-offset-2 ring-offset-background"
                      : "border-transparent",
                  )}
                  style={{ backgroundColor: PALETTE_COLORS[p.value] }}
                  title={p.label}
                />
              ))}
              <label className="relative cursor-pointer">
                <input
                  type="color"
                  value={localCustomColor}
                  onChange={handleCustomColorChange}
                  className="absolute inset-0 h-8 w-8 cursor-pointer opacity-0"
                />
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 border-muted-foreground/50 border-dashed transition-all hover:scale-110 hover:border-foreground",
                    palette === "custom" &&
                      "border-foreground ring-2 ring-foreground ring-offset-2 ring-offset-background",
                  )}
                  style={{
                    backgroundColor:
                      palette === "custom" ? localCustomColor : undefined,
                  }}
                  title="Custom color"
                >
                  {palette !== "custom" && (
                    <span
                      className="h-4 w-4 rounded-full"
                      style={{
                        background:
                          "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)",
                      }}
                    />
                  )}
                </div>
              </label>
            </div>
          </div>

          <div className="border-border border-t pt-4">
            <div className="space-y-2">
              <span className="font-semibold text-foreground text-sm">
                Holy Words Highlighting
              </span>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="holy-words"
                  checked={holyWordsEnabled}
                  onCheckedChange={(checked) =>
                    onHolyWordsEnabledChange(checked === true)
                  }
                />
                <label
                  htmlFor="holy-words"
                  className="cursor-pointer text-muted-foreground text-sm"
                >
                  Highlight Jesus' words
                </label>
              </div>
              {holyWordsEnabled && (
                <div className="space-y-2 pt-2">
                  <span className="text-muted-foreground text-sm">Color:</span>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => {
                          setLocalHolyWordsColor(preset.value);
                          onHolyWordsColorChange(preset.value);
                        }}
                        className={cn(
                          "h-8 w-8 cursor-pointer rounded-full border-2 transition-all hover:scale-110",
                          localHolyWordsColor === preset.value
                            ? "border-foreground ring-2 ring-foreground ring-offset-2 ring-offset-background"
                            : "border-transparent",
                        )}
                        style={{ backgroundColor: preset.value }}
                        title={preset.name}
                      />
                    ))}
                    <label className="relative cursor-pointer">
                      <input
                        type="color"
                        value={localHolyWordsColor}
                        onChange={handleHolyWordsColorChange}
                        className="absolute inset-0 h-8 w-8 cursor-pointer opacity-0"
                      />
                      <div
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full border-2 border-muted-foreground/50 border-dashed transition-all hover:scale-110 hover:border-foreground",
                          !COLOR_PRESETS.some(
                            (p) => p.value === localHolyWordsColor,
                          ) &&
                            "border-foreground ring-2 ring-foreground ring-offset-2 ring-offset-background",
                        )}
                        style={{
                          backgroundColor: !COLOR_PRESETS.some(
                            (p) => p.value === localHolyWordsColor,
                          )
                            ? localHolyWordsColor
                            : undefined,
                        }}
                        title="Custom color"
                      >
                        {COLOR_PRESETS.some(
                          (p) => p.value === localHolyWordsColor,
                        ) && (
                          <span
                            className="h-4 w-4 rounded-full"
                            style={{
                              background:
                                "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)",
                            }}
                          />
                        )}
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-border border-t pt-4">
            <div className="space-y-2">
              <span className="font-semibold text-foreground text-sm">
                Footer Verse
              </span>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="footer-verse"
                  checked={footerVerseEnabled}
                  onCheckedChange={(checked) =>
                    setFooterVerseEnabled(checked === true)
                  }
                />
                <label
                  htmlFor="footer-verse"
                  className="cursor-pointer text-muted-foreground text-sm"
                >
                  Show random Psalm verse in footer
                </label>
              </div>
            </div>
          </div>

          <div className="border-border border-t pt-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 font-semibold text-foreground text-sm">
                <Download className="h-4 w-4" />
                Settings Backup
              </div>
              <p className="text-muted-foreground text-xs">
                Export or import your preferences and settings as JSON
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2"
                  onClick={async () => {
                    try {
                      const theme = {
                        palette,
                        mode,
                        customColor,
                        footerVerseEnabled,
                      };
                      const json =
                        userPreferencesService.exportPreferences(theme);
                      const blob = new Blob([json], {
                        type: "application/json",
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `bible-settings-${new Date().toISOString().split("T")[0]}.json`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      toast.success("Settings exported successfully");
                    } catch {
                      toast.error("Failed to export settings");
                    }
                  }}
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2"
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "application/json";
                    input.onchange = async (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        try {
                          const text = await file.text();
                          const result =
                            userPreferencesService.importPreferences(text);

                          // Apply theme if present
                          if (result.hasTheme && result.theme) {
                            setPalette(result.theme.palette);
                            setMode(result.theme.mode);
                            if (result.theme.customColor) {
                              setCustomColor(result.theme.customColor);
                            }
                            if (result.theme.footerVerseEnabled !== undefined) {
                              setFooterVerseEnabled(
                                result.theme.footerVerseEnabled,
                              );
                            }
                          }

                          const messages = ["Settings imported successfully"];
                          if (result.bookmarksImported > 0) {
                            messages.push(
                              `${result.bookmarksImported} bookmarks added`,
                            );
                          }
                          toast.success(`${messages.join(". ")}. Reloading...`);
                          setTimeout(() => window.location.reload(), 1000);
                        } catch {
                          toast.error(
                            "Failed to import settings. Invalid JSON format.",
                          );
                        }
                      }
                    };
                    input.click();
                  }}
                >
                  <Upload className="h-4 w-4" />
                  Import
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4 text-muted-foreground text-sm">
            <p className="mb-1 flex items-center gap-2 font-semibold text-foreground">
              <Bookmark className="h-4 w-4" />
              Offline Support
            </p>
            <p>This app works offline. All Bible data is stored locally.</p>
          </div>

          <div className="space-y-2 border-border border-t pt-4">
            <a
              href={app.support.donate}
              target="_blank"
              rel="noopener noreferrer"
              className="flex cursor-pointer items-center justify-center gap-2 rounded-md bg-linear-to-r from-pink-500 to-rose-500 px-3 py-2 font-medium text-sm text-white shadow-sm transition-all hover:from-pink-600 hover:to-rose-600"
            >
              <Heart className="h-4 w-4 fill-current" />
              Support the Creator
            </a>
            <a
              href={app.support.feedback}
              target="_blank"
              rel="noopener noreferrer"
              className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-border bg-card px-3 py-2 font-medium text-foreground text-sm transition-all hover:bg-muted"
            >
              <MessageSquare className="h-4 w-4" />
              Feature Requests & Bugs
            </a>
            <a
              href={app.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-border bg-card px-3 py-2 font-medium text-foreground text-sm transition-all hover:bg-muted"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
          </div>

          <p className="pt-4 text-center text-muted-foreground text-xs">
            Created by{" "}
            <a
              href="https://brian-cooper.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline decoration-primary/50 underline-offset-2 transition-colors hover:text-primary/80 hover:decoration-primary"
            >
              {app.author.name}
            </a>
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SettingsSheet;
