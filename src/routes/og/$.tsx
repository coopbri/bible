import { Resvg } from "@resvg/resvg-js";
import { createFileRoute } from "@tanstack/react-router";
import satori from "satori";

import OgImage from "@/components/og/OgImage";
import { bibleApi } from "@/lib/bibleApi";

/** Crimson Pro font URLs (static TTFs from Fonthausen repo). */
const CRIMSON_PRO_REGULAR_URL =
  "https://raw.githubusercontent.com/Fonthausen/CrimsonPro/master/fonts/ttf/CrimsonPro-Regular.ttf";
const CRIMSON_PRO_BOLD_URL =
  "https://raw.githubusercontent.com/Fonthausen/CrimsonPro/master/fonts/ttf/CrimsonPro-Bold.ttf";

/** Cached font data. */
let fontCache: {
  regular: ArrayBuffer;
  bold: ArrayBuffer;
} | null = null;

/** Fetch Crimson Pro fonts for Satori (cached). */
const fetchFonts = async () => {
  if (fontCache) return fontCache;

  const [regular, bold] = await Promise.all([
    fetch(CRIMSON_PRO_REGULAR_URL).then((r) => r.arrayBuffer()),
    fetch(CRIMSON_PRO_BOLD_URL).then((r) => r.arrayBuffer()),
  ]);
  fontCache = { regular, bold };

  return fontCache;
};

/**
 * OG image route handler.
 * Generates dynamic PNG images for OpenGraph previews.
 *
 * URL pattern: `/og/{versionId}/{bookId}/{chapter}.png`
 */
export const Route = createFileRoute("/og/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = params._splat ?? "";

        if (!path.endsWith(".png")) {
          return new Response("Not found", { status: 404 });
        }

        const cleaned = path.replace(/\.png$/, "");
        const segments = cleaned.split("/").filter(Boolean);

        const versionId = segments[0] ?? "kjv";
        const bookId = parseInt(segments[1] ?? "1", 10);
        const chapter = parseInt(segments[2] ?? "1", 10);

        const book = bibleApi.getBookById(bookId);
        const versions = bibleApi.getVersions();
        const version = versions.find((v) => v.id === versionId);

        const bookName = book?.name ?? "Genesis";
        const versionCode = version?.code ?? "KJV";
        const testament = book?.testament ?? "OT";

        try {
          const fonts = await fetchFonts();

          const svg = await satori(
            <OgImage
              bookName={bookName}
              chapter={chapter}
              versionCode={versionCode}
              testament={testament}
            />,
            {
              width: 1200,
              height: 630,
              fonts: [
                {
                  name: "Crimson Pro",
                  data: fonts.regular,
                  weight: 400,
                  style: "normal",
                },
                {
                  name: "Crimson Pro",
                  data: fonts.bold,
                  weight: 700,
                  style: "normal",
                },
              ],
            },
          );

          const resvg = new Resvg(svg, {
            fitTo: { mode: "width", value: 1200 },
          });
          const pngData = resvg.render();
          const pngBuffer = pngData.asPng();

          return new Response(new Uint8Array(pngBuffer), {
            headers: {
              "Content-Type": "image/png",
              "Cache-Control": "public, max-age=86400, s-maxage=86400",
            },
          });
        } catch (error) {
          console.error("Error generating OG image for path:", path);
          console.error("Error:", error);

          return new Response("Error generating image", {
            status: 500,
          });
        }
      },
    },
  },
});
