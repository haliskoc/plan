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
  // 1. Modern Indigo
  coverIndigo: {
    backgroundColor: "#0a0d16",
    color: "#ffffff",
  },
  // 2. Creative Sunset
  coverSunset: {
    backgroundColor: "#0b0813",
    color: "#ffffff",
  },
  glowCircle1: {
    position: "absolute",
    top: 80,
    right: 40,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "#f97316",
    opacity: 0.15,
  },
  glowCircle2: {
    position: "absolute",
    bottom: 80,
    left: 40,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "#ec4899",
    opacity: 0.15,
  },
  // 3. Minimalist Slate
  coverSlate: {
    backgroundColor: "#f8fafc",
    color: "#0f172a",
    borderWidth: 8,
    borderColor: "#475569",
  },
  // 4. Academic Classic
  coverClassic: {
    backgroundColor: "#fbf9f4",
    color: "#1e1b4b",
    borderWidth: 1,
    borderColor: "#78350f",
    margin: 15,
  },
  classicInnerBorder: {
    borderWidth: 2,
    borderColor: "#78350f",
    padding: 30,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  // 5. Optical Clean
  coverOptical: {
    backgroundColor: "#ffffff",
    color: "#000000",
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

  const getCoverStyles = () => {
    switch (coverStyle) {
      case "modern-indigo":
        return {
          container: [styles.coverContainer, styles.coverIndigo],
          title: [styles.coverTitle, { color: "#818cf8" }],
          subtitle: [styles.coverSubtitle, { color: "#94a3b8" }],
          metaBox: [styles.coverMetaBox, { borderColor: "#312e81", backgroundColor: "#111827" }],
          metaText: { color: "#cbd5e1" },
          metaLabel: [styles.coverMetaLabel, { color: "#a5b4fc" }],
          badgeBg: "#312e81",
          badgeText: "#c7d2fe",
          decorations: null,
        };
      case "creative-sunset":
        return {
          container: [styles.coverContainer, styles.coverSunset],
          title: [styles.coverTitle, { color: "#ffffff" }],
          subtitle: [styles.coverSubtitle, { color: "#cbd5e1" }],
          metaBox: [styles.coverMetaBox, { borderColor: "#3f3f46", backgroundColor: "rgba(24, 24, 27, 0.7)" }],
          metaText: { color: "#e4e4e7" },
          metaLabel: [styles.coverMetaLabel, { color: "#fdba74" }],
          badgeBg: "#7c2d12",
          badgeText: "#ffedd5",
          decorations: (
            <>
              <View style={styles.glowCircle1} />
              <View style={styles.glowCircle2} />
            </>
          ),
        };
      case "minimalist-slate":
        return {
          container: [styles.coverContainer, styles.coverSlate],
          title: [styles.coverTitle, { color: "#0f172a" }],
          subtitle: [styles.coverSubtitle, { color: "#475569" }],
          metaBox: [styles.coverMetaBox, { borderColor: "#cbd5e1", backgroundColor: "#f8fafc" }],
          metaText: { color: "#334155" },
          metaLabel: [styles.coverMetaLabel, { color: "#475569" }],
          badgeBg: "#e2e8f0",
          badgeText: "#475569",
          decorations: null,
        };
      case "academic-classic":
        return {
          container: [styles.coverContainer, styles.coverClassic],
          title: [styles.coverTitle, { color: "#78350f", fontFamily: "Roboto", fontSize: 24, textTransform: "uppercase" as const, letterSpacing: 2 }],
          subtitle: [styles.coverSubtitle, { color: "#b45309", fontFamily: "Roboto" }],
          metaBox: [styles.coverMetaBox, { borderColor: "#b45309", backgroundColor: "#fafaf9", borderStyle: "solid" as const }],
          metaText: { color: "#78350f" },
          metaLabel: [styles.coverMetaLabel, { color: "#78350f" }],
          badgeBg: "#fef3c7",
          badgeText: "#92400e",
          decorations: null,
        };
      case "optical-clean":
      default:
        return {
          container: [styles.coverContainer, styles.coverOptical],
          title: [styles.coverTitle, { color: "#000000", letterSpacing: 1 }],
          subtitle: [styles.coverSubtitle, { color: "#475569" }],
          metaBox: [styles.coverMetaBox, { borderColor: "#000000", borderStyle: "solid" as const, borderWidth: 1.5, backgroundColor: "#ffffff" }],
          metaText: { color: "#000000" },
          metaLabel: [styles.coverMetaLabel, { color: "#000000" }],
          badgeBg: "#f1f5f9",
          badgeText: "#0f172a",
          decorations: (
            <View style={{ position: "absolute", top: 40, bottom: 40, right: 20, width: 10 }}>
              <TimingTracks />
            </View>
          ),
        };
    }
  };

  const currentTheme = getCoverStyles();

  return (
    <Page size="A4" style={[styles.page, { padding: 0 }]}>
      <View style={currentTheme.container}>
        {currentTheme.decorations}
        {coverStyle === "academic-classic" ? (
          <View style={styles.classicInnerBorder}>
            <Text style={currentTheme.title}>{title || "DERS NOTLARIM"}</Text>
            <Text style={currentTheme.subtitle}>Kişisel Konu ve Cornell Çalışma Defteri</Text>
            
            <View style={currentTheme.metaBox}>
              <View style={styles.coverMetaRow}>
                <Text style={currentTheme.metaLabel}>AD SOYAD:</Text>
                <Text style={[styles.coverMetaValue, currentTheme.metaText]}>{ownerName || "__________________"}</Text>
              </View>
              <View style={styles.coverMetaRow}>
                <Text style={currentTheme.metaLabel}>OLUŞTURMA TARİHİ:</Text>
                <Text style={[styles.coverMetaValue, currentTheme.metaText]}>{dateStr}</Text>
              </View>
            </View>

            {subjects.length > 0 && (
              <View style={styles.badgeContainer}>
                {subjects.map((sub, idx) => (
                  <Text key={idx} style={[styles.badge, { backgroundColor: currentTheme.badgeBg, color: currentTheme.badgeText }]}>
                    {sub}
                  </Text>
                ))}
              </View>
            )}
          </View>
        ) : (
          <>
            <Text style={currentTheme.title}>{title || "DERS NOTLARIM"}</Text>
            <Text style={currentTheme.subtitle}>Kişisel Konu ve Defter Notları</Text>
            
            <View style={currentTheme.metaBox}>
              <View style={styles.coverMetaRow}>
                <Text style={currentTheme.metaLabel}>ÖĞRENCİ ADI:</Text>
                <Text style={[styles.coverMetaValue, currentTheme.metaText]}>{ownerName || "__________________"}</Text>
              </View>
              <View style={styles.coverMetaRow}>
                <Text style={currentTheme.metaLabel}>TARİH:</Text>
                <Text style={[styles.coverMetaValue, currentTheme.metaText]}>{dateStr}</Text>
              </View>
              {subjects.length > 0 && (
                <View style={[styles.coverMetaRow, { marginTop: 4 }]}>
                  <Text style={currentTheme.metaLabel}>KAPSAM:</Text>
                  <Text style={currentTheme.metaText}>{subjects.length} Ders</Text>
                </View>
              )}
            </View>

            {subjects.length > 0 && (
              <View style={styles.badgeContainer}>
                {subjects.map((sub, idx) => (
                  <Text key={idx} style={[styles.badge, { backgroundColor: currentTheme.badgeBg, color: currentTheme.badgeText }]}>
                    {sub}
                  </Text>
                ))}
              </View>
            )}
          </>
        )}
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
