"use client";

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Svg,
  Line,
  Circle,
  Rect,
  Path,
} from "@react-pdf/renderer";

// Register Roboto font if not registered
let fontRegistered = false;
if (typeof window !== "undefined" && !fontRegistered) {
  try {
    Font.register({
      family: "Roboto",
      fonts: [
        { src: "/fonts/Roboto-Regular.ttf", fontWeight: "normal" },
        { src: "/fonts/Roboto-Bold.ttf", fontWeight: "bold" },
      ],
    });
    fontRegistered = true;
  } catch {}
}

export type CoverStyle = "modern-indigo" | "creative-sunset" | "minimalist-slate" | "academic-classic" | "optical-clean" | "none";
export type TemplateStyle = "cornell" | "optik" | "ruled" | "grid" | "dotted";

interface NotebookPDFProps {
  title: string;
  ownerName: string;
  subjects: string[];
  pageCount: number;
  coverStyle: CoverStyle;
  templateStyle: TemplateStyle;
}

// A4 dimensions: 595.28 x 841.89
const styles = StyleSheet.create({
  // Global page style
  page: {
    fontFamily: "Roboto",
    backgroundColor: "#ffffff",
    padding: 35,
    position: "relative",
    height: "100%",
  },
  
  // Header styles
  pageHeader: {
    borderBottomWidth: 1.5,
    borderBottomColor: "#6366f1",
    paddingBottom: 8,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  headerLeft: {
    flexDirection: "column",
  },
  headerRight: {
    flexDirection: "column",
    alignItems: "flex-end",
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1e293b",
  },
  headerSubtitle: {
    fontSize: 8,
    color: "#64748b",
    marginTop: 2,
  },
  headerMetaText: {
    fontSize: 8,
    color: "#475569",
    fontWeight: "bold",
  },

  // Footer styles
  pageFooter: {
    position: "absolute",
    bottom: 20,
    left: 35,
    right: 35,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 7.5,
    color: "#94a3b8",
  },

  // Note template general containers
  contentArea: {
    flex: 1,
    marginTop: 5,
    position: "relative",
  },

  // CORNELL LAYOUT
  cornellWrapper: {
    flexDirection: "column",
    flex: 1,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 4,
    overflow: "hidden",
  },
  cornellMainRow: {
    flexDirection: "row",
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
  },
  cornellCueCol: {
    width: "28%",
    borderRightWidth: 1,
    borderRightColor: "#cbd5e1",
    backgroundColor: "#fafaf9",
    padding: 10,
  },
  cornellNotesCol: {
    width: "72%",
    padding: 0,
    position: "relative",
  },
  cornellSummaryRow: {
    height: 120,
    backgroundColor: "#fcfcfc",
    padding: 10,
    position: "relative",
  },
  sectionLabel: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#a8a29e",
    textTransform: "uppercase",
    marginBottom: 5,
  },

  // OPTİK LAYOUT ELEMENTS
  optikHeaderBlock: {
    borderWidth: 1,
    borderColor: "#475569",
    borderRadius: 6,
    padding: 8,
    marginBottom: 10,
    flexDirection: "row",
    backgroundColor: "#f8fafc",
  },
  optikSubjectGrid: {
    width: "55%",
    borderRightWidth: 1,
    borderRightColor: "#cbd5e1",
    paddingRight: 6,
  },
  optikMetaGrid: {
    width: "45%",
    paddingLeft: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  optikBubbleCol: {
    alignItems: "center",
  },
  bubbleLabel: {
    fontSize: 6.5,
    fontWeight: "bold",
    color: "#334155",
    marginBottom: 2,
    textAlign: "center",
  },
  bubbleRow: {
    flexDirection: "row",
    gap: 3,
    marginBottom: 2.5,
    alignItems: "center",
  },
  bubbleCell: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    borderWidth: 0.8,
    borderColor: "#475569",
    justifyContent: "center",
    alignItems: "center",
  },
  bubbleCellFilled: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
  },
  bubbleText: {
    fontSize: 5,
    color: "#475569",
    fontWeight: "bold",
  },
  bubbleTextFilled: {
    fontSize: 5,
    color: "#ffffff",
    fontWeight: "bold",
  },
  optikTimingTrack: {
    position: "absolute",
    right: 0,
    top: 50,
    bottom: 50,
    width: 12,
    alignItems: "center",
    justifyContent: "space-between",
  },
  timingBlock: {
    width: 10,
    height: 7,
    backgroundColor: "#000000",
  },

  // COVER PAGES GENERAL
  coverContainer: {
    fontFamily: "Roboto",
    width: "100%",
    height: "100%",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  coverTitle: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    zIndex: 10,
  },
  coverSubtitle: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 40,
    zIndex: 10,
  },
  coverMetaBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    width: "80%",
    zIndex: 10,
  },
  coverMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    fontSize: 9,
  },
  coverMetaLabel: {
    fontWeight: "bold",
  },
  coverMetaValue: {
  },
  badgeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 5,
    marginTop: 15,
    zIndex: 10,
  },
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
    fontSize: 8,
    fontWeight: "bold",
  },

  // COVERS STYLING DETAIL
  indigoTitleCard: {
    backgroundColor: "rgba(10, 13, 24, 0.85)",
    borderWidth: 1.5,
    borderColor: "#6366f1",
    borderRadius: 12,
    padding: 28,
    width: "85%",
    alignItems: "center",
    zIndex: 10,
  },
  sunsetTitleCard: {
    backgroundColor: "rgba(8, 5, 14, 0.75)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
    padding: 28,
    width: "85%",
    alignItems: "center",
    zIndex: 10,
  },
  classicTitleCard: {
    backgroundColor: "#faf8f2",
    borderWidth: 1.5,
    borderColor: "#d97706",
    borderRadius: 0,
    padding: 25,
    width: "85%",
    alignItems: "center",
    zIndex: 10,
  },
  classicInnerBorder: {
    borderWidth: 1,
    borderColor: "#d97706",
    padding: 20,
    width: "100%",
    alignItems: "center",
  },
  opticalTitleCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1.8,
    borderColor: "#000000",
    borderRadius: 4,
    padding: 20,
    width: "85%",
    zIndex: 10,
  },
  zenContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
    paddingTop: 100,
    paddingBottom: 100,
    paddingLeft: 60,
    paddingRight: 60,
    justifyContent: "space-between",
  },
  zenTitleSection: {
    width: "100%",
  },
  zenTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1c1917",
    letterSpacing: 4,
  },
  zenSubtitle: {
    fontSize: 9,
    color: "#6b6661",
    marginTop: 6,
    letterSpacing: 1.5,
  },
  zenMetaSection: {
    borderLeftWidth: 1.5,
    borderLeftColor: "#991b1b",
    paddingLeft: 12,
    alignSelf: "flex-end",
    marginTop: 180,
  },
  zenMetaText: {
    fontSize: 8.5,
    color: "#44403c",
    marginBottom: 4,
    letterSpacing: 1,
  },
});

// Helper for rendering Cornell ruled lines
const CornellRuledLines = ({ height, spacing = 22 }: { height: number; spacing?: number }) => {
  const lineCount = Math.floor(height / spacing);
  return (
    <View style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}>
      {Array.from({ length: lineCount }).map((_, idx) => (
        <View
          key={idx}
          style={{
            borderBottomWidth: 0.5,
            borderBottomColor: "#e2e8f0",
            height: spacing,
          }}
        />
      ))}
    </View>
  );
};

// Helper for rendering Ruled Lines
const NoteRuledLines = ({ spacing = 24, padding = 10 }: { spacing?: number; padding?: number }) => {
  const lineCount = 27;
  return (
    <View style={{ width: "100%", paddingVertical: padding }}>
      {Array.from({ length: lineCount }).map((_, idx) => (
        <View
          key={idx}
          style={{
            borderBottomWidth: 0.6,
            borderBottomColor: "#cbd5e1",
            height: spacing,
          }}
        />
      ))}
    </View>
  );
};

// Helper for Grid Pattern using SVG
const GridPattern = () => {
  const width = 525; // 595 - 70 padding
  const height = 690; // 841 - 150 padding/header
  const cellSize = 18;
  const cols = Math.floor(width / cellSize);
  const rows = Math.floor(height / cellSize);
  
  return (
    <Svg style={{ width: "100%", height: "100%" }}>
      {Array.from({ length: rows }).map((_, r) => (
        <Line
          key={`h-${r}`}
          x1={0}
          y1={r * cellSize}
          x2={width}
          y2={r * cellSize}
          stroke="#cbd5e1"
          strokeWidth={0.5}
        />
      ))}
      {Array.from({ length: cols }).map((_, c) => (
        <Line
          key={`v-${c}`}
          x1={c * cellSize}
          y1={0}
          x2={c * cellSize}
          y2={height}
          stroke="#cbd5e1"
          strokeWidth={0.5}
        />
      ))}
    </Svg>
  );
};

// Helper for Dotted Pattern using SVG
const DottedPattern = () => {
  const width = 525;
  const height = 690;
  const dotSpacing = 18;
  const cols = Math.floor(width / dotSpacing);
  const rows = Math.floor(height / dotSpacing);

  return (
    <Svg style={{ width: "100%", height: "100%" }}>
      {Array.from({ length: rows }).map((_, r) => (
        Array.from({ length: cols }).map((_, c) => (
          <Circle
            key={`d-${r}-${c}`}
            cx={c * dotSpacing + 8}
            cy={r * dotSpacing + 8}
            r={0.8}
            fill="#94a3b8"
          />
        ))
      ))}
    </Svg>
  );
};

// Helper to draw Optical timing tracks on page edge
const TimingTracks = () => {
  const count = 32;
  return (
    <View style={styles.optikTimingTrack}>
      {Array.from({ length: count }).map((_, idx) => (
        <View key={idx} style={styles.timingBlock} />
      ))}
    </View>
  );
};

// Subject code mapper for optical bubble sheet
const OPTICAL_SUBJECTS = [
  { short: "MAT", name: "Matematik" },
  { short: "GEO", name: "Geometri" },
  { short: "FIZ", name: "Fizik" },
  { short: "KIM", name: "Kimya" },
  { short: "BIY", name: "Biyoloji" },
  { short: "TUR", name: "Türkçe" },
  { short: "EDB", name: "Edebiyat" },
  { short: "TAR", name: "Tarih" },
  { short: "COG", name: "Coğrafya" },
  { short: "FEL", name: "Felsefe" },
  { short: "DIN", name: "Din Kültürü" },
];

// Cover page rendering subcomponent
// ─── COVER PAGE BACKGROUNDS ──────────────────────────────────────────

const CyberpunkGridBackground = () => (
  <View style={{ position: "absolute", left: 0, top: 0, width: 595.28, height: 841.89, zIndex: -10 }} fixed>
    <Svg style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%" }}>
      <Rect x={0} y={0} width={595.28} height={841.89} fill="#05070f" />
      {Array.from({ length: 35 }).map((_, i) => (
        <Line key={`h-${i}`} x1={0} y1={i * 25} x2={595.28} y2={i * 25} stroke="#1e1b4b" strokeWidth={0.8} opacity={0.4} />
      ))}
      {Array.from({ length: 25 }).map((_, i) => (
        <Line key={`v-${i}`} x1={i * 25} y1={0} x2={i * 25} y2={841.89} stroke="#1e1b4b" strokeWidth={0.8} opacity={0.4} />
      ))}
      {/* Neon glowing line accents */}
      <Line x1={20} y1={20} x2={60} y2={20} stroke="#6366f1" strokeWidth={2.5} />
      <Line x1={20} y1={20} x2={20} y2={60} stroke="#6366f1" strokeWidth={2.5} />
      <Line x1={575.28} y1={20} x2={535.28} y2={20} stroke="#06b6d4" strokeWidth={2.5} />
      <Line x1={575.28} y1={20} x2={575.28} y2={60} stroke="#06b6d4" strokeWidth={2.5} />
      <Line x1={20} y1={821.89} x2={60} y2={821.89} stroke="#06b6d4" strokeWidth={2.5} />
      <Line x1={20} y1={821.89} x2={20} y2={781.89} stroke="#06b6d4" strokeWidth={2.5} />
      <Line x1={575.28} y1={821.89} x2={535.28} y2={821.89} stroke="#6366f1" strokeWidth={2.5} />
      <Line x1={575.28} y1={821.89} x2={575.28} y2={781.89} stroke="#6366f1" strokeWidth={2.5} />
    </Svg>
  </View>
);

const SpaceOdysseyBackground = () => (
  <View style={{ position: "absolute", left: 0, top: 0, width: 595.28, height: 841.89, zIndex: -10, overflow: "hidden", backgroundColor: "#060814" }} fixed>
    {/* Nebula orange/pink/blue glows */}
    <View style={{ position: "absolute", top: 120, left: 80, width: 400, height: 400, borderRadius: 200, backgroundColor: "#f97316", opacity: 0.08 }} />
    <View style={{ position: "absolute", bottom: 100, right: 60, width: 350, height: 350, borderRadius: 175, backgroundColor: "#6366f1", opacity: 0.07 }} />
    <View style={{ position: "absolute", top: 380, left: 180, width: 220, height: 220, borderRadius: 110, backgroundColor: "#d946ef", opacity: 0.04 }} />

    <Svg style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%" }}>
      {/* Background celestial coordinates grid */}
      {Array.from({ length: 9 }).map((_, i) => {
        const radius = 60 + i * 50;
        return (
          <Circle
            key={`orbit-${i}`}
            cx={297.64}
            cy={420.94}
            r={radius}
            stroke="#ffffff"
            strokeWidth={0.4}
            strokeDasharray={i % 2 === 0 ? "4, 6" : "2, 3"}
            opacity={0.15}
          />
        );
      })}
      
      {/* Constellation lines */}
      {/* Ursa Major (Big Dipper) sketch */}
      <Line x1={80} y1={120} x2={110} y2={130} stroke="#ffffff" strokeWidth={0.5} opacity={0.3} />
      <Line x1={110} y1={130} x2={140} y2={125} stroke="#ffffff" strokeWidth={0.5} opacity={0.3} />
      <Line x1={140} y1={125} x2={165} y2={155} stroke="#ffffff" strokeWidth={0.5} opacity={0.3} />
      <Line x1={165} y1={155} x2={145} y2={185} stroke="#ffffff" strokeWidth={0.5} opacity={0.3} />
      <Line x1={145} y1={185} x2={105} y2={180} stroke="#ffffff" strokeWidth={0.5} opacity={0.3} />
      <Line x1={105} y1={180} x2={165} y2={155} stroke="#ffffff" strokeWidth={0.5} opacity={0.3} />

      {/* Orion-like constellation */}
      <Line x1={450} y1={680} x2={480} y2={710} stroke="#ffffff" strokeWidth={0.5} opacity={0.3} />
      <Line x1={480} y1={710} x2={465} y2={750} stroke="#ffffff" strokeWidth={0.5} opacity={0.3} />
      <Line x1={465} y1={750} x2={435} y2={730} stroke="#ffffff" strokeWidth={0.5} opacity={0.3} />
      <Line x1={435} y1={730} x2={450} y2={680} stroke="#ffffff" strokeWidth={0.5} opacity={0.3} />
      {/* Belt */}
      <Circle cx={445} cy={715} r={1.5} fill="#fbbf24" />
      <Circle cx={453} cy={718} r={1.5} fill="#fbbf24" />
      <Circle cx={461} cy={721} r={1.5} fill="#fbbf24" />

      {/* Compass / Windrose in top right corner */}
      <Circle cx={520} cy={80} r={28} stroke="#ffffff" strokeWidth={0.6} opacity={0.2} fill="transparent" />
      <Line x1={520} y1={46} x2={520} y2={114} stroke="#ffffff" strokeWidth={0.6} opacity={0.3} />
      <Line x1={486} y1={80} x2={554} y2={80} stroke="#ffffff" strokeWidth={0.6} opacity={0.3} />
      {/* Compass pointer */}
      <Path d="M 520 52 L 524 80 L 520 84 L 516 80 Z" fill="#f97316" opacity={0.6} />
      <Path d="M 520 108 L 524 80 L 520 84 L 516 80 Z" fill="#ffffff" opacity={0.4} />

      {/* Compass / Windrose in bottom left corner */}
      <Circle cx={75} cy={760} r={28} stroke="#ffffff" strokeWidth={0.6} opacity={0.2} fill="transparent" />
      <Line x1={75} y1={726} x2={75} y2={794} stroke="#ffffff" strokeWidth={0.6} opacity={0.3} />
      <Line x1={41} y1={760} x2={109} y2={760} stroke="#ffffff" strokeWidth={0.6} opacity={0.3} />
      <Path d="M 75 732 L 79 760 L 75 764 L 71 760 Z" fill="#fbbf24" opacity={0.6} />
      <Path d="M 75 788 L 79 760 L 75 764 L 71 760 Z" fill="#ffffff" opacity={0.4} />

      {/* Celestial coordinate markers */}
      <Line x1={297.64} y1={20} x2={297.64} y2={821.89} stroke="#ffffff" strokeWidth={0.3} strokeDasharray="3, 10" opacity={0.12} />
      <Line x1={20} y1={420.94} x2={575.28} y2={420.94} stroke="#ffffff" strokeWidth={0.3} strokeDasharray="3, 10" opacity={0.12} />

      {/* Scattered Golden & White Stars */}
      <Circle cx={120} cy={220} r={1.5} fill="#fbbf24" opacity={0.8} />
      <Circle cx={210} cy={140} r={1.0} fill="#ffffff" opacity={0.6} />
      <Circle cx={440} cy={180} r={2.0} fill="#fbbf24" opacity={0.9} />
      <Circle cx={380} cy={280} r={1.2} fill="#ffffff" opacity={0.7} />
      <Circle cx={180} cy={600} r={1.8} fill="#fbbf24" opacity={0.8} />
      <Circle cx={240} cy={710} r={1.0} fill="#ffffff" opacity={0.5} />
      <Circle cx={130} cy={480} r={1.5} fill="#ffffff" opacity={0.7} />
      <Circle cx={480} cy={340} r={2.0} fill="#fbbf24" opacity={0.9} />
      <Circle cx={510} cy={540} r={1.2} fill="#ffffff" opacity={0.6} />
      <Circle cx={90} cy={350} r={1.0} fill="#ffffff" opacity={0.5} />

      {/* Intricate Saturn in Center Piece */}
      {/* Back ring */}
      <Path d="M 230 426 C 240 405, 355 405, 365 426" stroke="#fbbf24" strokeWidth={5} fill="transparent" opacity={0.65} />
      <Path d="M 215 429 C 230 398, 365 398, 380 429" stroke="#f97316" strokeWidth={2.5} fill="transparent" opacity={0.5} />
      
      {/* Planet Sphere */}
      <Circle cx={297.64} cy={420.94} r={46} fill="#1e1b4b" stroke="#ffffff" strokeWidth={0.8} />
      {/* Planet Shading/Stripes */}
      <Path d="M 252 425 C 275 435, 320 435, 343 425 C 320 430, 275 430, 252 425 Z" fill="#fbbf24" opacity={0.4} />
      <Path d="M 256 412 C 275 420, 320 420, 339 412 C 320 415, 275 415, 256 412 Z" fill="#f97316" opacity={0.3} />

      {/* Front ring */}
      <Path d="M 230 426 C 220 435, 250 448, 297.64 448 C 345 448, 375 435, 365 426" stroke="#fbbf24" strokeWidth={5.5} fill="transparent" />
      <Path d="M 215 429 C 200 442, 240 455, 297.64 455 C 355 455, 395 442, 380 429" stroke="#f97316" strokeWidth={3.0} fill="transparent" opacity={0.8} />
      <Path d="M 205 431 C 190 446, 235 460, 297.64 460 C 360 460, 405 446, 390 431" stroke="#ffffff" strokeWidth={1.0} fill="transparent" opacity={0.6} />

      {/* Small Moon Orbiting */}
      <Circle cx={220} cy={390} r={4.5} fill="#ffffff" stroke="#fbbf24" strokeWidth={0.5} />
      <Circle cx={395} cy={460} r={2.0} fill="#f97316" />
    </Svg>
  </View>
);

const ZenWabiSabiBackground = () => (
  <View style={{ position: "absolute", left: 0, top: 0, width: 595.28, height: 841.89, zIndex: -10, backgroundColor: "#f4f1ea" }} fixed>
    <Svg style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%" }}>
      {/* Zen red sun */}
      <Circle cx={297.64} cy={310} r={85} fill="#991b1b" opacity={0.9} />
      {/* Thin line grid */}
      <Line x1={297.64} y1={60} x2={297.64} y2={780} stroke="#44403c" strokeWidth={0.5} opacity={0.3} />
      <Line x1={60} y1={520} x2={535} y2={520} stroke="#44403c" strokeWidth={0.8} opacity={0.3} />
      <Rect x={287.64} y={510} width={20} height={20} fill="#44403c" opacity={0.9} />
    </Svg>
  </View>
);

const VintageGoldFrameBackground = () => (
  <View style={{ position: "absolute", left: 0, top: 0, width: 595.28, height: 841.89, zIndex: -10, backgroundColor: "#250910", borderStyle: "solid", borderLeftWidth: 15, borderRightWidth: 15, borderTopWidth: 15, borderBottomWidth: 15, borderColor: "#1c060c" }} fixed>
    <Svg style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%" }}>
      {/* Outer gold line */}
      <Rect x={8} y={8} width={549.28} height={795.89} stroke="#d97706" strokeWidth={2.2} fill="transparent" />
      {/* Inner gold line */}
      <Rect x={13} y={13} width={539.28} height={785.89} stroke="#d97706" strokeWidth={0.8} fill="transparent" />
      
      {/* Vintage corner boxes */}
      <Rect x={8} y={8} width={18} height={18} fill="#d97706" />
      <Rect x={539.28} y={8} width={18} height={18} fill="#d97706" />
      <Rect x={8} y={785.89} width={18} height={18} fill="#d97706" />
      <Rect x={539.28} y={785.89} width={18} height={18} fill="#d97706" />
      
      <Circle cx={30} cy={30} r={6} stroke="#d97706" strokeWidth={0.8} fill="transparent" />
      <Circle cx={535.28} cy={30} r={6} stroke="#d97706" strokeWidth={0.8} fill="transparent" />
      <Circle cx={30} cy={781.89} r={6} stroke="#d97706" strokeWidth={0.8} fill="transparent" />
      <Circle cx={535.28} cy={781.89} r={6} stroke="#d97706" strokeWidth={0.8} fill="transparent" />
    </Svg>
  </View>
);

const OpticalTechnicalBackground = () => (
  <View style={{ position: "absolute", left: 0, top: 0, width: 595.28, height: 841.89, zIndex: -10, backgroundColor: "#ffffff" }} fixed>
    <Svg style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%" }}>
      {/* Faint technical coordinate grid */}
      {Array.from({ length: 42 }).map((_, i) => (
        <Line key={`h-${i}`} x1={0} y1={i * 20} x2={595.28} y2={i * 20} stroke="#f1f5f9" strokeWidth={0.6} />
      ))}
      {Array.from({ length: 30 }).map((_, i) => (
        <Line key={`v-${i}`} x1={i * 20} y1={0} x2={i * 20} y2={841.89} stroke="#f1f5f9" strokeWidth={0.6} />
      ))}
      
      {/* Timing Tracks on margins */}
      {Array.from({ length: 40 }).map((_, i) => (
        <React.Fragment key={i}>
          <Rect x={15} y={i * 20 + 20} width={10} height={7} fill="#000000" />
          <Rect x={570} y={i * 20 + 20} width={10} height={7} fill="#000000" />
        </React.Fragment>
      ))}

      {/* Aesthetic matrix in center bottom */}
      {Array.from({ length: 8 }).map((_, r) => (
        <React.Fragment key={r}>
          {Array.from({ length: 16 }).map((_, c) => (
            <Circle key={`${r}-${c}`} cx={155 + c * 19} cy={560 + r * 15} r={4} stroke="#475569" strokeWidth={0.8} fill="transparent" />
          ))}
        </React.Fragment>
      ))}
    </Svg>
  </View>
);

// Cover page rendering subcomponent
const NotebookCover = ({
  title,
  ownerName,
  subjects,
  coverStyle,
}: {
  title: string;
  ownerName: string;
  subjects: string[];
  coverStyle: CoverStyle;
}) => {
  if (coverStyle === "none") return null;

  const dateStr = new Date().toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const renderCoverContent = () => {
    switch (coverStyle) {
      case "modern-indigo":
        return (
          <>
            <CyberpunkGridBackground />
            <View style={styles.indigoTitleCard}>
              <Text style={{ fontSize: 8, color: "#06b6d4", fontWeight: "bold", letterSpacing: 2, marginBottom: 8, textTransform: "uppercase" }}>
                // YKS 2027 DIGITAL SYSTEM
              </Text>
              <Text style={[styles.coverTitle, { color: "#ffffff", fontSize: 24, marginBottom: 12 }]}>
                {title.toUpperCase() || "ÇALIŞMA DEFTERİ"}
              </Text>
              <Text style={[styles.coverSubtitle, { color: "#818cf8", fontSize: 9, marginBottom: 25, letterSpacing: 1 }]}>
                Kişisel Ders Takip ve Cornell Notları
              </Text>
              
              <View style={[styles.coverMetaBox, { borderColor: "#312e81", backgroundColor: "rgba(17, 24, 39, 0.7)", width: "100%" }]}>
                <View style={styles.coverMetaRow}>
                  <Text style={[styles.coverMetaLabel, { color: "#818cf8" }]}>ÖĞRENCİ:</Text>
                  <Text style={{ color: "#ffffff", fontWeight: "bold", fontSize: 9 }}>{ownerName.toUpperCase() || "ÖĞRENCİ KODLANMADI"}</Text>
                </View>
                <View style={styles.coverMetaRow}>
                  <Text style={[styles.coverMetaLabel, { color: "#818cf8" }]}>TARİH:</Text>
                  <Text style={{ color: "#cbd5e1", fontSize: 9 }}>{dateStr}</Text>
                </View>
              </View>

              {subjects.length > 0 && (
                <View style={styles.badgeContainer}>
                  {subjects.map((sub, idx) => (
                    <Text key={idx} style={[styles.badge, { backgroundColor: "#312e81", color: "#c7d2fe" }]}>
                      {sub}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          </>
        );

      case "creative-sunset":
        return (
          <>
            <SpaceOdysseyBackground />
            <View style={styles.sunsetTitleCard}>
              <Text style={{ fontSize: 8, color: "#fbbf24", fontWeight: "bold", letterSpacing: 3, marginBottom: 8 }}>
                SPACE ODYSSEY // KOZMİK KEŞİF
              </Text>
              <Text style={[styles.coverTitle, { color: "#ffffff", fontSize: 24, marginBottom: 12 }]}>
                {title.toUpperCase() || "KOZMİK KEŞİF DEFTERİ"}
              </Text>
              <Text style={[styles.coverSubtitle, { color: "#cbd5e1", fontSize: 9, marginBottom: 25, letterSpacing: 1.2 }]}>
                Kişisel Çalışma Planı ve Cornell Notları
              </Text>
              
              <View style={[styles.coverMetaBox, { borderColor: "rgba(251, 191, 36, 0.35)", backgroundColor: "rgba(6, 8, 20, 0.75)", width: "100%" }]}>
                <View style={styles.coverMetaRow}>
                  <Text style={[styles.coverMetaLabel, { color: "#fbbf24" }]}>AD SOYAD:</Text>
                  <Text style={{ color: "#ffffff", fontWeight: "bold", fontSize: 9 }}>{ownerName.toUpperCase() || "____________________"}</Text>
                </View>
                <View style={styles.coverMetaRow}>
                  <Text style={[styles.coverMetaLabel, { color: "#fbbf24" }]}>TARİH:</Text>
                  <Text style={{ color: "#cbd5e1", fontSize: 9 }}>{dateStr}</Text>
                </View>
              </View>

              {subjects.length > 0 && (
                <View style={styles.badgeContainer}>
                  {subjects.map((sub, idx) => (
                    <Text key={idx} style={[styles.badge, { backgroundColor: "#f97316", color: "#ffffff", borderStyle: "solid", borderWidth: 0.5, borderColor: "#fbbf24" }]}>
                      {sub}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          </>
        );

      case "minimalist-slate":
        return (
          <View style={styles.zenContainer}>
            <ZenWabiSabiBackground />
            <View style={styles.zenTitleSection}>
              <Text style={styles.zenTitle}>{title.toUpperCase() || "DERS DEFTERİ"}</Text>
              <Text style={styles.zenSubtitle}>KİŞİSEL ÇALIŞMA NOTLARI VE ANALİZLERİ</Text>
              {subjects.length > 0 && (
                <View style={[styles.badgeContainer, { justifyContent: "flex-start", marginTop: 15 }]}>
                  {subjects.map((sub, idx) => (
                    <Text key={idx} style={[styles.badge, { backgroundColor: "#e4e2db", color: "#44403c", borderWidth: 0.5, borderColor: "#cbd5e1" }]}>
                      {sub}
                    </Text>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.zenMetaSection}>
              <Text style={styles.zenMetaText}>YAZAR: {ownerName.toUpperCase() || "BİLİNMEYEN ÖĞRENCİ"}</Text>
              <Text style={styles.zenMetaText}>TARİH: {dateStr}</Text>
              <Text style={[styles.zenMetaText, { color: "#78716c", fontSize: 7.5, marginTop: 4 }]}>
                YKS ÇALIŞMA ODASI TARAFINDAN OLUŞTURULDU
              </Text>
            </View>
          </View>
        );

      case "academic-classic":
        return (
          <>
            <VintageGoldFrameBackground />
            <View style={styles.classicTitleCard}>
              <View style={styles.classicInnerBorder}>
                <Text style={{ fontSize: 9, color: "#d97706", fontWeight: "bold", letterSpacing: 4, marginBottom: 15, textTransform: "uppercase" }}>
                  COLLEGII STUDIORUM
                </Text>
                
                <Text style={[styles.coverTitle, { color: "#78350f", fontSize: 20, textTransform: "uppercase" as const, letterSpacing: 2, marginBottom: 15 }]}>
                  {title || "DERS NOTLARIM"}
                </Text>
                
                <Text style={{ fontSize: 8, color: "#b45309", marginBottom: 30, letterSpacing: 1.5 }}>
                  YKS Sınavına Hazırlık Ders Defteri
                </Text>

                <View style={[styles.coverMetaBox, { borderColor: "#d97706", backgroundColor: "#fdfbf7", width: "100%", borderWidth: 1, padding: 12 }]}>
                  <View style={[styles.coverMetaRow, { marginBottom: 6 }]}>
                    <Text style={{ fontWeight: "bold", color: "#78350f", fontSize: 8 }}>ÖĞRENCİ ADI:</Text>
                    <Text style={{ color: "#78350f", fontSize: 8, fontWeight: "bold" }}>{ownerName.toUpperCase() || "____________________"}</Text>
                  </View>
                  <View style={styles.coverMetaRow}>
                    <Text style={{ fontWeight: "bold", color: "#78350f", fontSize: 8 }}>TARİH:</Text>
                    <Text style={{ color: "#78350f", fontSize: 8 }}>{dateStr}</Text>
                  </View>
                </View>

                {subjects.length > 0 && (
                  <View style={styles.badgeContainer}>
                    {subjects.map((sub, idx) => (
                      <Text key={idx} style={[styles.badge, { backgroundColor: "#fef3c7", color: "#92400e", borderWidth: 0.5, borderColor: "#f59e0b" }]}>
                        {sub}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </>
        );

      case "optical-clean":
      default:
        return (
          <>
            <OpticalTechnicalBackground />
            <View style={styles.opticalTitleCard}>
              <View style={{ borderBottomWidth: 1.8, borderBottomColor: "#000000", paddingBottom: 8, marginBottom: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontSize: 10, fontWeight: "bold", color: "#000000", letterSpacing: 1.5 }}>
                  OPTİK NOT DEFTERİ
                </Text>
                <Text style={{ fontSize: 7, fontWeight: "bold", color: "#ffffff", backgroundColor: "#000000", paddingHorizontal: 4, paddingVertical: 1 }}>
                  FORM: YKS-2027
                </Text>
              </View>

              <Text style={[styles.coverTitle, { color: "#000000", fontSize: 20, textAlign: "left", marginBottom: 8 }]}>
                {title.toUpperCase() || "DERS ÇALIŞMA DEFTERİ"}
              </Text>
              
              <Text style={{ fontSize: 8, color: "#475569", marginBottom: 20, lineHeight: 1.3 }}>
                Bu defter optik okuyucu düzenine göre tasarlanmış not şablonları içermektedir. Lütfen kurşun kalem kullanınız.
              </Text>

              <View style={[styles.coverMetaBox, { borderColor: "#000000", borderWidth: 1.2, padding: 12, width: "100%" }]}>
                <View style={[styles.coverMetaRow, { marginBottom: 6 }]}>
                  <Text style={{ fontWeight: "bold", color: "#000000", fontSize: 8 }}>AD SOYAD:</Text>
                  <Text style={{ color: "#000000", fontSize: 8, fontWeight: "bold" }}>{ownerName.toUpperCase() || "____________________"}</Text>
                </View>
                <View style={styles.coverMetaRow}>
                  <Text style={{ fontWeight: "bold", color: "#000000", fontSize: 8 }}>TARİH:</Text>
                  <Text style={{ color: "#000000", fontSize: 8 }}>{dateStr}</Text>
                </View>
              </View>

              {subjects.length > 0 && (
                <View style={[styles.badgeContainer, { justifyContent: "flex-start", marginTop: 12 }]}>
                  {subjects.map((sub, idx) => (
                    <Text key={idx} style={[styles.badge, { backgroundColor: "#000000", color: "#ffffff", borderRadius: 2 }]}>
                      {sub.toUpperCase()}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          </>
        );
    }
  };

  return (
    <Page size="A4" style={[styles.page, { padding: 0 }]}>
      <View style={styles.coverContainer}>
        {renderCoverContent()}
      </View>
    </Page>
  );
};

// Component for note sheet pages
const NotePage = ({
  pageIndex,
  title,
  subjects,
  templateStyle,
}: {
  pageIndex: number;
  title: string;
  subjects: string[];
  templateStyle: TemplateStyle;
}) => {
  const mainSubject = subjects[0] || "Özel Not";

  const renderTemplateContent = () => {
    switch (templateStyle) {
      case "cornell":
        return (
          <View style={styles.cornellWrapper}>
            <View style={styles.cornellMainRow}>
              {/* Cue Column */}
              <View style={styles.cornellCueCol}>
                <Text style={styles.sectionLabel}>ANAHTAR KAVRAMLAR / SORULAR</Text>
                <CornellRuledLines height={450} spacing={25} />
              </View>
              {/* Notes Column */}
              <View style={styles.cornellNotesCol}>
                <View style={{ paddingLeft: 10, paddingRight: 5, paddingTop: 10 }}>
                  <Text style={styles.sectionLabel}>ÇALIŞMA NOTLARI</Text>
                </View>
                <CornellRuledLines height={450} spacing={22} />
              </View>
            </View>
            {/* Summary Row */}
            <View style={styles.cornellSummaryRow}>
              <Text style={styles.sectionLabel}>ÖZET VE ÇIKARIMLAR</Text>
              <CornellRuledLines height={85} spacing={22} />
            </View>
          </View>
        );

      case "optik":
        return (
          <View style={{ flex: 1 }}>
            <View style={styles.optikHeaderBlock}>
              {/* Subject Bubble Selection */}
              <View style={styles.optikSubjectGrid}>
                <Text style={styles.bubbleLabel}>DERS KODLAMA</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4, paddingRight: 4 }}>
                  {OPTICAL_SUBJECTS.map((sub, i) => {
                    const isSelected = subjects.includes(sub.name);
                    return (
                      <View key={i} style={styles.bubbleRow}>
                        <View style={isSelected ? styles.bubbleCellFilled : styles.bubbleCell}>
                          <Text style={isSelected ? styles.bubbleTextFilled : styles.bubbleText}>
                            {sub.short[0]}
                          </Text>
                        </View>
                        <Text style={{ fontSize: 5.5, color: "#334155" }}>{sub.short}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
              
              {/* Meta Bubble Selection (Date & Page Number) */}
              <View style={styles.optikMetaGrid}>
                {/* Date Bubble Grid */}
                <View style={styles.optikBubbleCol}>
                  <Text style={styles.bubbleLabel}>GÜN</Text>
                  <View style={{ flexDirection: "row", gap: 2 }}>
                    {/* Tens place 0-3 */}
                    <View style={{ gap: 1 }}>
                      {[0, 1, 2, 3].map(v => (
                        <View key={v} style={styles.bubbleCell}><Text style={styles.bubbleText}>{v}</Text></View>
                      ))}
                    </View>
                    {/* Ones place 0-9 */}
                    <View style={{ gap: 1 }}>
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(v => (
                        <View key={v} style={[styles.bubbleCell, { width: 8, height: 8, borderRadius: 4 }]}><Text style={[styles.bubbleText, { fontSize: 4.5 }]}>{v}</Text></View>
                      ))}
                    </View>
                  </View>
                </View>

                <View style={styles.optikBubbleCol}>
                  <Text style={styles.bubbleLabel}>AY</Text>
                  <View style={{ flexDirection: "row", gap: 2 }}>
                    <View style={{ gap: 1 }}>
                      {[0, 1].map(v => (
                        <View key={v} style={styles.bubbleCell}><Text style={styles.bubbleText}>{v}</Text></View>
                      ))}
                    </View>
                    <View style={{ gap: 1 }}>
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(v => (
                        <View key={v} style={[styles.bubbleCell, { width: 8, height: 8, borderRadius: 4 }]}><Text style={[styles.bubbleText, { fontSize: 4.5 }]}>{v}</Text></View>
                      ))}
                    </View>
                  </View>
                </View>

                {/* Page bubble selection */}
                <View style={styles.optikBubbleCol}>
                  <Text style={styles.bubbleLabel}>SAYFA</Text>
                  <View style={{ flexDirection: "row", gap: 2 }}>
                    {/* Tens place */}
                    <View style={{ gap: 1 }}>
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(v => {
                        const tens = Math.floor(pageIndex / 10) % 10;
                        const isCurrent = tens === v;
                        return (
                          <View key={v} style={isCurrent ? [styles.bubbleCellFilled, { width: 8, height: 8, borderRadius: 4 }] : [styles.bubbleCell, { width: 8, height: 8, borderRadius: 4 }]}>
                            <Text style={isCurrent ? [styles.bubbleTextFilled, { fontSize: 4.5 }] : [styles.bubbleText, { fontSize: 4.5 }]}>{v}</Text>
                          </View>
                        );
                      })}
                    </View>
                    {/* Ones place */}
                    <View style={{ gap: 1 }}>
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(v => {
                        const ones = pageIndex % 10;
                        const isCurrent = ones === v;
                        return (
                          <View key={v} style={isCurrent ? [styles.bubbleCellFilled, { width: 8, height: 8, borderRadius: 4 }] : [styles.bubbleCell, { width: 8, height: 8, borderRadius: 4 }]}>
                            <Text style={isCurrent ? [styles.bubbleTextFilled, { fontSize: 4.5 }] : [styles.bubbleText, { fontSize: 4.5 }]}>{v}</Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Note Area with Dotted Pattern + margin timing track */}
            <View style={{ flex: 1, borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 4, overflow: "hidden", padding: 5 }}>
              <DottedPattern />
            </View>
            <TimingTracks />
          </View>
        );

      case "ruled":
        return <NoteRuledLines />;

      case "grid":
        return (
          <View style={{ flex: 1, borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 4, overflow: "hidden" }}>
            <GridPattern />
          </View>
        );

      case "dotted":
        return (
          <View style={{ flex: 1, borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 4, overflow: "hidden" }}>
            <DottedPattern />
          </View>
        );
      default:
        return <NoteRuledLines />;
    }
  };

  return (
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.pageHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>{title || "DERS NOTLARI"}</Text>
          <Text style={styles.headerSubtitle}>{templateStyle.toUpperCase()} Not Şablonu</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.headerMetaText}>{mainSubject.toUpperCase()}</Text>
          <Text style={styles.headerSubtitle}>Tarih: ____/____/20__</Text>
        </View>
      </View>

      {/* Content Workspace */}
      <View style={styles.contentArea}>{renderTemplateContent()}</View>

      {/* Footer */}
      <View style={styles.pageFooter}>
        <Text style={styles.footerText}>YKS Çalışma Defteri • {mainSubject}</Text>
        <Text style={styles.footerText}>Sayfa {pageIndex}</Text>
      </View>
    </Page>
  );
};

export const NotebookPDF = ({
  title,
  ownerName,
  subjects,
  pageCount,
  coverStyle,
  templateStyle,
}: NotebookPDFProps) => {
  const pages = Array.from({ length: pageCount });

  return (
    <Document>
      {/* 1. Cover page if enabled */}
      {coverStyle !== "none" && (
        <NotebookCover
          title={title}
          ownerName={ownerName}
          subjects={subjects}
          coverStyle={coverStyle}
        />
      )}
      
      {/* 2. Notebook sheets */}
      {pages.map((_, index) => (
        <NotePage
          key={index}
          pageIndex={index + 1}
          title={title}
          subjects={subjects}
          templateStyle={templateStyle}
        />
      ))}
    </Document>
  );
};
