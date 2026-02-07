import type { CSSProperties, ReactNode } from "react";

interface OgImageProps {
  bookName: string;
  chapter: number;
  versionCode: string;
  testament: "OT" | "NT" | "DC";
}

/** Sage-dark gradient for OG image background. */
const GRADIENT = {
  from: "#1a3a2a",
  via: "#0f2518",
  to: "#0a1a10",
};

/** Testament display labels. */
const TESTAMENT_LABELS: Record<string, string> = {
  OT: "Old Testament",
  NT: "New Testament",
  DC: "Deuterocanonical",
};

/** Inline SVG cross icon for the header. */
const CrossIcon = (): ReactNode => (
  <div
    style={{
      display: "flex",
      width: 56,
      height: 56,
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={32}
      height={32}
      viewBox="0 0 24 24"
      fill="none"
      stroke="rgba(255, 255, 255, 0.9)"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="Cross"
    >
      <path d="M12 2v20" />
      <path d="M2 7h20" />
    </svg>
  </div>
);

/**
 * OG image component for Satori rendering.
 * Uses inline styles (Satori requirement).
 */
const OgImage = ({
  bookName,
  chapter,
  versionCode,
  testament,
}: OgImageProps): ReactNode => {
  const containerStyle: CSSProperties = {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "60px",
    background: `linear-gradient(135deg, ${GRADIENT.from} 0%, ${GRADIENT.via} 50%, ${GRADIENT.to} 100%)`,
    fontFamily: "Crimson Pro",
  };

  const headerStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  };

  const brandTextStyle: CSSProperties = {
    fontSize: "28px",
    color: "#fff",
    opacity: 0.9,
    fontWeight: 400,
  };

  const contentStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    flex: 1,
    justifyContent: "center",
  };

  const bookNameStyle: CSSProperties = {
    fontSize: bookName.length > 20 ? "56px" : "72px",
    fontWeight: 700,
    color: "#fff",
    lineHeight: 1.1,
    margin: 0,
  };

  const chapterStyle: CSSProperties = {
    fontSize: "48px",
    fontWeight: 400,
    color: "rgba(255, 255, 255, 0.7)",
    lineHeight: 1.2,
    margin: 0,
  };

  const footerStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  };

  const testamentStyle: CSSProperties = {
    fontSize: "18px",
    color: "rgba(255, 255, 255, 0.6)",
    textTransform: "uppercase",
    letterSpacing: "3px",
  };

  const domainStyle: CSSProperties = {
    fontSize: "18px",
    color: "rgba(255, 255, 255, 0.4)",
  };

  const versionBadgeStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  };

  const versionCodeStyle: CSSProperties = {
    fontSize: "20px",
    color: "rgba(255, 255, 255, 0.5)",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: "4px 12px",
    borderRadius: "6px",
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <CrossIcon />
        <span style={brandTextStyle}>Holy Bible</span>
      </div>

      <div style={contentStyle}>
        <h1 style={bookNameStyle}>{bookName}</h1>
        <p style={chapterStyle}>Chapter {chapter}</p>
      </div>

      <div style={footerStyle}>
        <div style={versionBadgeStyle}>
          <span style={testamentStyle}>
            {TESTAMENT_LABELS[testament] ?? testament}
          </span>
          <span style={versionCodeStyle}>{versionCode}</span>
        </div>
        <span style={domainStyle}>bible.brian.software</span>
      </div>
    </div>
  );
};

export default OgImage;
