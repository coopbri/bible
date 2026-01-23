import { TanStackDevtools } from "@tanstack/react-devtools";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { useEffect, useRef } from "react";
import { Toaster } from "sonner";

import appCss from "@/index.css?url";
import { initializeCollections } from "@/lib/db/collections";
import ThemeProvider from "@/providers/ThemeProvider";
import { getThemeServerFn } from "@/server/functions/theme";

import type { QueryClient } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";

/**
 * Root route.
 */
export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      {
        name: "description",
        content: "A local-first Bible reader PWA with offline support",
      },
      { name: "theme-color", content: "#1e293b" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: "Bible" },
      { name: "msapplication-TileColor", content: "#1e293b" },
      // Open Graph
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Holy Bible" },
      {
        property: "og:description",
        content: "A local-first Bible reader PWA with offline support",
      },
      { property: "og:url", content: "https://bible.brian.software" },
      { property: "og:image", content: "https://bible.brian.software/og.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      // Twitter
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Holy Bible" },
      {
        name: "twitter:description",
        content: "A local-first Bible reader PWA with offline support",
      },
      { name: "twitter:image", content: "https://bible.brian.software/og.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "apple-touch-icon", href: "/icons/icon-192x192.png" },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap",
      },
    ],
  }),
  loader: () => getThemeServerFn(),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

/**
 * Register service worker.
 * Uses skipWaiting + clientsClaim for automatic updates.
 */
let controllerChangeHandled = false;

const registerServiceWorker = async () => {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  // Reload once when a new SW takes control (ensures fresh assets)
  if (!controllerChangeHandled) {
    controllerChangeHandled = true;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      window.location.reload();
    });
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js");
    console.info("SW registered:", registration.scope);
  } catch (error) {
    console.error("SW registration failed:", error);
  }
};

/**
 * Root document.
 */
function RootDocument({ children }: PropsWithChildren) {
  const { queryClient } = Route.useRouteContext();
  const theme = Route.useLoaderData();
  const collectionsInitialized = useRef(false);

  // Initialize TanStack DB collections
  useEffect(() => {
    if (!collectionsInitialized.current) {
      collectionsInitialized.current = true;
      initializeCollections();
    }
  }, []);

  // Register service worker on client
  useEffect(() => {
    registerServiceWorker();
  }, []);

  // Build class string: palette name + "dark" if dark mode
  const themeClass = `${theme.palette}${theme.mode === "dark" ? " dark" : ""}`;

  return (
    <html suppressHydrationWarning lang="en" className={themeClass}>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider theme={theme}>
          <QueryClientProvider client={queryClient}>
            <div id="root" className="h-full">
              {children}
            </div>
            <Toaster />
          </QueryClientProvider>
        </ThemeProvider>

        <TanStackDevtools
          plugins={[
            {
              name: "TanStack Router",
              render: <TanStackRouterDevtoolsPanel />,
              defaultOpen: true,
            },
            {
              name: "TanStack Query",
              render: <ReactQueryDevtoolsPanel />,
            },
          ]}
        />

        <Scripts />
      </body>
    </html>
  );
}
