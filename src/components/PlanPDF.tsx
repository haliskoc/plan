"use client";

import React from "react";
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  Font,
  Image
} from "@react-pdf/renderer";
import { PlanItem, PdfSettings } from "@/store/usePlanStore";
import { YKS_TOPICS, TOPICS_MAP } from "@/data/topics";
import { formatFullDate, formatMonthName } from "@/utils/dates";
import { differenceInDays, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, format } from "date-fns";
import { tr } from "date-fns/locale";

Font.register({
  family: "Roboto",
  fonts: [
    { src: "/fonts/Roboto-Regular.ttf", fontWeight: "normal" },
    { src: "/fonts/Roboto-Bold.ttf", fontWeight: "bold" }
  ]
});

function getSubjectColorsPDF(subject: string | undefined) {
  if (!subject) return { bg: "#f8fafc", text: "#475569", border: "#e2e8f0" };
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    Matematik: { bg: "#eff6ff", text: "#1d4ed8", border: "#3b82f6" },
    Geometri: { bg: "#ecfeff", text: "#0e7490", border: "#06b6d4" },
    Fizik: { bg: "#e0e7ff", text: "#4338ca", border: "#6366f1" },
    Kimya: { bg: "#ecfdf5", text: "#047857", border: "#10b981" },
    Biyoloji: { bg: "#f0fdf4", text: "#15803d", border: "#22c55e" },
    Türkçe: { bg: "#fffbeb", text: "#b45309", border: "#f59e0b" },
    Edebiyat: { bg: "#fff7ed", text: "#c2410c", border: "#f97316" },
    Tarih: { bg: "#fff5f5", text: "#b91c1c", border: "#f43f5e" },
    "Tarih-2": { bg: "#fef2f2", text: "#dc2626", border: "#ef4444" },
    Coğrafya: { bg: "#f0fdfa", text: "#0f766e", border: "#14b8a6" },
    "Coğrafya-2": { bg: "#f0f9ff", text: "#0369a1", border: "#0ea5e9" },
    Felsefe: { bg: "#f5f3ff", text: "#6d28d9", border: "#8b5cf6" },
    "Felsefe Grubu": { bg: "#faf5ff", text: "#7e22ce", border: "#a855f7" },
    "Din Kültürü": { bg: "#fefce8", text: "#a16207", border: "#eab308" },
    "Din Kültürü (AYT)": { bg: "#f7fee7", text: "#4d7c0f", border: "#84cc16" },
  };
  return colors[subject] || { bg: "#f8fafc", text: "#475569", border: "#e2e8f0" };
}

function buildStyles(pdf: PdfSettings) {
  const bgDark = pdf.backgroundColorAvg 
    ? (0.299 * parseInt(pdf.backgroundColorAvg.slice(1,3), 16) + 0.587 * parseInt(pdf.backgroundColorAvg.slice(3,5), 16) + 0.114 * parseInt(pdf.backgroundColorAvg.slice(5,7), 16)) / 255 < 0.5
    : false;
  const txt = bgDark ? pdf.textColorLight : pdf.textColorDark;
  const txtSub = bgDark ? "#cbd5e1" : "#64748b";
  const txtMuted = bgDark ? "#94a3b8" : "#94a3b8";
  const borderCol = bgDark ? "#334155" : "#e2e8f0";
  const bgLight = bgDark ? "rgba(255,255,255,0.08)" : "#f8fafc";
  const bgRow = bgDark ? "rgba(255,255,255,0.04)" : "#f8f9fa";

  return StyleSheet.create({
    page: {
      fontFamily: "Roboto",
      padding: 30,
      backgroundColor: "#ffffff",
      position: "relative",
    },
    header: {
      borderBottomWidth: 1.5,
      borderBottomColor: "#6366f1",
      paddingBottom: 12,
      marginBottom: 20,
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
    },
    title: { fontSize: 16, fontWeight: "bold", color: txt },
    subtitle: { fontSize: 9, color: txtSub, marginTop: 4 },
    countdownText: { fontSize: 9.5, color: bgDark ? "#fca5a5" : "#e11d48", fontWeight: "bold" },
    sectionTitle: { fontSize: 10.5, fontWeight: "bold", color: txt, marginBottom: 8, marginTop: 10, backgroundColor: bgLight, paddingVertical: 5, paddingHorizontal: 8, borderRadius: 4 },
    table: { display: "flex", flexDirection: "column", marginTop: 8, borderWidth: 1, borderColor: borderCol, borderRadius: 6, overflow: "hidden" },
    tableHeader: { flexDirection: "row", backgroundColor: bgLight, borderBottomWidth: 1, borderBottomColor: borderCol, paddingVertical: 8, fontWeight: "bold" },
    tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: borderCol, paddingVertical: 8, alignItems: "center" },
    tableRowAlternate: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: borderCol, paddingVertical: 8, alignItems: "center", backgroundColor: bgRow },
    colCheckbox: { width: "8%", textAlign: "center", fontSize: 9, color: txtSub },
    colTopic: { width: "42%", paddingLeft: 8, fontSize: 9, color: txt },
    colSubject: { width: "20%", fontSize: 9, display: "flex", flexDirection: "row" },
    colDuration: { width: "12%", textAlign: "center", fontSize: 9, color: txt, fontWeight: "bold" },
    colNote: { width: "18%", paddingRight: 8, fontSize: 8.5, color: txtSub },
    noteBox: { marginTop: 25, padding: 12, backgroundColor: bgDark ? "rgba(99,102,241,0.15)" : "#f5f3ff", borderLeftWidth: 3, borderLeftColor: "#6366f1", borderRadius: 4 },
    noteTitle: { fontSize: 9.5, fontWeight: "bold", color: bgDark ? "#a5b4fc" : "#4338ca", marginBottom: 4 },
    noteText: { fontSize: 8.5, color: bgDark ? "#c7d2fe" : "#4f46e5", lineHeight: 1.4 },
    footer: { position: "absolute", bottom: 25, left: 30, right: 30, borderTopWidth: 1, borderTopColor: borderCol, paddingTop: 8, display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", fontSize: 8, color: txtMuted },
    weeklyGrid: { display: "flex", flexDirection: "row", marginTop: 12, borderWidth: 1, borderColor: borderCol, borderRadius: 6, minHeight: 330, overflow: "hidden" },
    weeklyColumn: { flex: 1, borderRightWidth: 1, borderRightColor: borderCol, display: "flex", flexDirection: "column", backgroundColor: "transparent" },
    weeklyColumnLast: { flex: 1, display: "flex", flexDirection: "column", backgroundColor: "transparent" },
    weeklyDayHeader: { backgroundColor: bgLight, borderBottomWidth: 1, borderBottomColor: borderCol, paddingVertical: 8, paddingHorizontal: 4, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" },
    weeklyDayName: { fontWeight: "bold", fontSize: 9.5, color: txt },
    weeklyDayDate: { fontSize: 7.5, color: txtSub, marginTop: 2 },
    weeklyCardList: { padding: 6, flex: 1, display: "flex", flexDirection: "column" },
    weeklyCard: { borderLeftWidth: 3, borderWidth: 0.5, borderStyle: "solid", borderColor: borderCol, borderRadius: 4, padding: 5, marginBottom: 5, display: "flex", flexDirection: "column" },
    weeklyCardText: { fontSize: 8, fontWeight: "bold", color: txt, lineHeight: 1.2 },
    weeklyCardSub: { fontSize: 7, fontWeight: "bold", marginTop: 2 },
    weeklyCardDuration: { fontSize: 7, color: txtSub, marginTop: 2, fontWeight: "bold" },
    checklistSectionTitle: { fontSize: 12, fontWeight: "bold", color: txt, marginBottom: 6, marginTop: 8, borderBottomWidth: 1.5, borderBottomColor: "#6366f1", paddingBottom: 4 },
    checklistSubjectTitle: { fontSize: 9, fontWeight: "bold", color: txt, marginTop: 6, marginBottom: 3, paddingVertical: 3, paddingHorizontal: 8, backgroundColor: bgLight, borderRadius: 3 },
    checklistRow: { flexDirection: "row", alignItems: "center", paddingVertical: 1.5, paddingHorizontal: 4, borderBottomWidth: 0.5, borderBottomColor: borderCol },
    checklistCheckbox: { width: 10, height: 10, borderWidth: 1, borderColor: txtMuted, borderRadius: 2 },
    checklistTopicName: { fontSize: 8, color: txt, flex: 1 },
    checklistNumber: { fontSize: 7, color: txtMuted, width: 18, textAlign: "right", marginRight: 6 },
  });
}

// ─── BACKGROUND IMAGE WRAPPER ───────────────────────────────────────

function BackgroundLayer({ image, opacity, children }: { image: string; opacity: number; children: React.ReactNode }) {
  return (
    <View style={{ position: "relative", flex: 1 }}>
      {image && (
        <Image
          src={image}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            opacity: opacity / 100,
            objectFit: "cover",
          }}
        />
      )}
      <View style={{ flex: 1 }}>
        {children}
      </View>
    </View>
  );
}

// ─── TOPIC CHECKLIST PAGES ──────────────────────────────────────────

interface TopicChecklistPageProps {
  planTitle: string;
  examDateStr: string;
  track: "SAY" | "EA" | "SOZ";
  pdf: PdfSettings;
}

function getTrackLabel(track: "SAY" | "EA" | "SOZ"): string {
  if (track === "SAY") return "Sayısal (SAY)";
  if (track === "EA") return "Eşit Ağırlık (EA)";
  return "Sözel (SÖZ)";
}

function getTrackFilteredTopics(track: "SAY" | "EA" | "SOZ") {
  const tytTopics = YKS_TOPICS.filter((t) => t.examType === "TYT");
  let aytTopics = YKS_TOPICS.filter((t) => t.examType === "AYT");
  if (track === "SAY") aytTopics = aytTopics.filter((t) => t.track === "SAY" || t.track === "ORTAK");
  else if (track === "EA") aytTopics = aytTopics.filter((t) => t.track === "EA" || t.track === "ORTAK");
  else if (track === "SOZ") aytTopics = aytTopics.filter((t) => t.track === "SOZ" || t.track === "EA");
  return { tytTopics, aytTopics };
}

function groupTopicsBySubject(topics: typeof YKS_TOPICS) {
  const groups: Record<string, typeof YKS_TOPICS> = {};
  topics.forEach((t) => {
    if (!groups[t.subject]) groups[t.subject] = [];
    groups[t.subject].push(t);
  });
  return Object.keys(groups).sort().map((subject) => ({
    subject,
    topics: groups[subject].sort((a, b) => a.order - b.order),
  }));
}

export function TopicChecklistPage({ planTitle, examDateStr, track, pdf }: TopicChecklistPageProps) {
  const daysLeft = Math.max(0, differenceInDays(parseISO(examDateStr), new Date()));
  const { tytTopics, aytTopics } = getTrackFilteredTopics(track);
  const tytGroups = groupTopicsBySubject(tytTopics);
  const aytGroups = groupTopicsBySubject(aytTopics);
  const trackLabel = getTrackLabel(track);
  const s = buildStyles(pdf);

  const renderSection = (groups: ReturnType<typeof groupTopicsBySubject>, sectionLabel: string, startIndex: number) => {
    let idx = startIndex;
    return (
      <View>
        <Text style={s.checklistSectionTitle}>{sectionLabel}</Text>
        {groups.map((group) => (
          <View key={group.subject}>
            <Text style={s.checklistSubjectTitle}>{group.subject} ({group.topics.length} konu)</Text>
            {group.topics.map((topic) => {
              idx++;
              return (
                <View key={topic.id} style={s.checklistRow} wrap={false}>
                  <Text style={s.checklistNumber}>{idx}.</Text>
                  <View style={s.checklistCheckbox} />
                  <Text style={{ fontSize: 7, color: "#94a3b8", width: 18, textAlign: "center" }}>ög</Text>
                  <View style={s.checklistCheckbox} />
                  <Text style={{ fontSize: 7, color: "#94a3b8", width: 18, textAlign: "center" }}>sç</Text>
                  <Text style={s.checklistTopicName}>{topic.name}</Text>
                </View>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  const noteBox = (
    <View style={s.noteBox}>
      <Text style={s.noteTitle}>Kullanım: Öğ=Öğrendim / Sç=Soru Çözümü Tamam</Text>
      <Text style={s.noteText}>{trackLabel} alanına göre YKS&apos;de sorumlu olduğunuz tüm konular.</Text>
    </View>
  );

  const orientation = pdf.monthlyOrientation === "landscape" ? "landscape" : "portrait";

  return (
    <>
      <Page size="A4" orientation={orientation} style={s.page}>
        <BackgroundLayer image={pdf.backgroundImage} opacity={pdf.backgroundOpacity}>
          <View style={s.header}>
            <View>
              <Text style={s.title}>{planTitle}</Text>
              <Text style={s.subtitle}>TYT Konu Takip Listesi — {trackLabel}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={s.countdownText}>YKS&apos;ye {daysLeft} Gün</Text>
              <Text style={s.subtitle}>Hedef: {examDateStr}</Text>
            </View>
          </View>
          {renderSection(tytGroups, "TYT Konuları (Temel Yeterlilik Testi)", 0)}
          <View style={{ marginTop: 15 }}>{noteBox}</View>
          <View style={s.footer}>
            <Text>TYT Konu Takip Listesi • {trackLabel} Alanı</Text>
            <Text>{tytTopics.length} konu</Text>
          </View>
        </BackgroundLayer>
      </Page>

      <Page size="A4" orientation={orientation} style={s.page}>
        <BackgroundLayer image={pdf.backgroundImage} opacity={pdf.backgroundOpacity}>
          <View style={s.header}>
            <View>
              <Text style={s.title}>{planTitle}</Text>
              <Text style={s.subtitle}>AYT Konu Takip Listesi — {trackLabel}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={s.countdownText}>YKS&apos;ye {daysLeft} Gün</Text>
              <Text style={s.subtitle}>Hedef: {examDateStr}</Text>
            </View>
          </View>
          {renderSection(aytGroups, `AYT Konuları — ${trackLabel}`, tytTopics.length)}
          <View style={{ marginTop: 15 }}>{noteBox}</View>
          <View style={s.footer}>
            <Text>AYT Konu Takip Listesi • {trackLabel} Alanı</Text>
            <Text>{aytTopics.length} konu</Text>
          </View>
        </BackgroundLayer>
      </Page>
    </>
  );
}

// ─── BASE PROPS ─────────────────────────────────────────────────────

interface BasePDFProps {
  planTitle: string;
  examDateStr: string;
  selectedTrack: "SAY" | "EA" | "SOZ";
  pdfSettings: PdfSettings;
}

// ─── 1. DAILY PDF ───────────────────────────────────────────────────

interface DailyPDFProps extends BasePDFProps {
  dateStr: string;
  items: PlanItem[];
}

export function DailyPDF({ planTitle, examDateStr, dateStr, items, selectedTrack, pdfSettings }: DailyPDFProps) {
  const daysLeft = Math.max(0, differenceInDays(parseISO(examDateStr), new Date()));
  const formattedDate = formatFullDate(dateStr);
  const s = buildStyles(pdfSettings);
  const orientation = pdfSettings.dailyOrientation === "landscape" ? "landscape" : "portrait";

  return (
    <Document>
      <Page size="A4" orientation={orientation} style={s.page}>
        <BackgroundLayer image={pdfSettings.backgroundImage} opacity={pdfSettings.backgroundOpacity}>
          <View style={s.header}>
            <View>
              <Text style={s.title}>{planTitle}</Text>
              <Text style={s.subtitle}>Günlük Çalışma Planı - {formattedDate}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={s.countdownText}>YKS&apos;ye {daysLeft} Gün Kaldı</Text>
              <Text style={s.subtitle}>Sınav Tarihi: {examDateStr}</Text>
            </View>
          </View>

          <Text style={s.sectionTitle}>Günün Çalışma Maddeleri</Text>

          {items.length === 0 ? (
            <Text style={{ fontSize: 9.5, color: "#94a3b8", marginTop: 25, textAlign: "center" }}>
              Bugün için planlanmış herhangi bir çalışma bulunmamaktadır.
            </Text>
          ) : (
            <View style={s.table}>
              <View style={s.tableHeader}>
                <Text style={[s.colCheckbox, { fontWeight: "bold" }]}>Durum</Text>
                <Text style={[s.colTopic, { fontWeight: "bold" }]}>Konu Başlığı</Text>
                <Text style={[s.colSubject, { fontWeight: "bold", paddingLeft: 4 }]}>Ders</Text>
                <Text style={[s.colDuration, { fontWeight: "bold" }]}>Süre</Text>
                <Text style={[s.colNote, { fontWeight: "bold" }]}>Not</Text>
              </View>
              {items.map((item, index) => {
                const topic = TOPICS_MAP.get(item.topicId);
                const rowStyle = index % 2 === 0 ? s.tableRow : s.tableRowAlternate;
                const isDone = item.status === "tamamlandi";
                const subColors = getSubjectColorsPDF(topic?.subject);
                return (
                  <View key={item.id} style={rowStyle}>
                    <Text style={s.colCheckbox}>{isDone ? "[x]" : "[  ]"}</Text>
                    <Text style={s.colTopic}>{topic?.name || "Bilinmeyen"}</Text>
                    <View style={s.colSubject}>
                      <Text style={{ color: subColors.text, backgroundColor: subColors.bg, paddingVertical: 2, paddingHorizontal: 6, borderRadius: 3, fontSize: 7.5, fontWeight: "bold", borderWidth: 0.5, borderColor: subColors.border, textAlign: "center" }}>
                        {topic?.subject || "-"}
                      </Text>
                    </View>
                    <Text style={s.colDuration}>{item.durationMinutes} dk</Text>
                    <Text style={s.colNote}>{item.note || ""}</Text>
                  </View>
                );
              })}
            </View>
          )}

          <View style={s.noteBox}>
            <Text style={s.noteTitle}>Planlayıcı Tavsiyesi</Text>
            <Text style={s.noteText}>
              Her çalışma oturumundan sonra 10-15 dakika mola verin. Çalıştığınız konuların ardından mutlaka soru çözümü yaparak pekiştirin.
            </Text>
          </View>

          <View style={s.footer}>
            <Text>YKS Çalışma Planlayıcısı</Text>
            <Text>Sayfa 1 / 3</Text>
          </View>
        </BackgroundLayer>
      </Page>

      <TopicChecklistPage planTitle={planTitle} examDateStr={examDateStr} track={selectedTrack} pdf={pdfSettings} />
    </Document>
  );
}

// ─── 2. WEEKLY PDF ──────────────────────────────────────────────────

interface WeeklyPDFProps extends BasePDFProps {
  selectedDateStr: string;
  items: PlanItem[];
}

export function WeeklyPDF({ planTitle, examDateStr, selectedDateStr, items, selectedTrack, pdfSettings }: WeeklyPDFProps) {
  const daysLeft = Math.max(0, differenceInDays(parseISO(examDateStr), new Date()));
  const date = parseISO(selectedDateStr);
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });
  const weekRangeStr = `${format(start, "d MMMM", { locale: tr })} - ${format(end, "d MMMM yyyy", { locale: tr })}`;
  const s = buildStyles(pdfSettings);
  const orientation = pdfSettings.weeklyOrientation === "landscape" ? "landscape" : "portrait";

  return (
    <Document>
      <Page size="A4" orientation={orientation} style={s.page}>
        <BackgroundLayer image={pdfSettings.backgroundImage} opacity={pdfSettings.backgroundOpacity}>
          <View style={s.header}>
            <View>
              <Text style={s.title}>{planTitle}</Text>
              <Text style={s.subtitle}>Haftalık Ders Çalışma Planı ({weekRangeStr})</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={s.countdownText}>YKS&apos;ye {daysLeft} Gün Kaldı</Text>
              <Text style={s.subtitle}>Hedef Sınav: {examDateStr}</Text>
            </View>
          </View>

          <View style={s.weeklyGrid}>
            {days.map((day, idx) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const dayItems = items.filter((item) => item.date === dateStr);
              const isLast = idx === 6;
              return (
                <View key={dateStr} style={isLast ? s.weeklyColumnLast : s.weeklyColumn}>
                  <View style={s.weeklyDayHeader}>
                    <Text style={s.weeklyDayName}>{format(day, "EEEE", { locale: tr })}</Text>
                    <Text style={s.weeklyDayDate}>{format(day, "d MMM", { locale: tr })}</Text>
                  </View>
                  <View style={s.weeklyCardList}>
                    {dayItems.map((item) => {
                      const topic = TOPICS_MAP.get(item.topicId);
                      const sc = getSubjectColorsPDF(topic?.subject);
                      return (
                        <View key={item.id} style={[s.weeklyCard, { backgroundColor: sc.bg, borderLeftColor: sc.border }]}>
                          <Text style={s.weeklyCardText}>{topic?.name || "Konu"}</Text>
                          <Text style={[s.weeklyCardSub, { color: sc.text }]}>{topic?.subject || "Ders"}</Text>
                          <Text style={s.weeklyCardDuration}>{item.durationMinutes} dk</Text>
                        </View>
                      );
                    })}
                    {dayItems.length === 0 && (
                      <Text style={{ fontSize: 7.5, color: "#94a3b8", textAlign: "center", marginTop: 25 }}>Boş</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>

          <View style={s.footer}>
            <Text>YKS Çalışma Planlayıcısı - Haftalık Görünüm</Text>
            <Text>Sayfa 1 / 3</Text>
          </View>
        </BackgroundLayer>
      </Page>

      <TopicChecklistPage planTitle={planTitle} examDateStr={examDateStr} track={selectedTrack} pdf={pdfSettings} />
    </Document>
  );
}

// ─── 3. MONTHLY PDF ─────────────────────────────────────────────────

interface MonthlyPDFProps extends BasePDFProps {
  selectedMonthStr: string;
  items: PlanItem[];
}

export function MonthlyPDF({ planTitle, examDateStr, selectedMonthStr, items, selectedTrack, pdfSettings }: MonthlyPDFProps) {
  const daysLeft = Math.max(0, differenceInDays(parseISO(examDateStr), new Date()));
  const formattedMonth = formatMonthName(selectedMonthStr);
  const s = buildStyles(pdfSettings);
  const orientation = pdfSettings.monthlyOrientation === "landscape" ? "landscape" : "portrait";
  const bgDark = pdfSettings.backgroundColorAvg
    ? (0.299 * parseInt(pdfSettings.backgroundColorAvg.slice(1, 3), 16) + 0.587 * parseInt(pdfSettings.backgroundColorAvg.slice(3, 5), 16) + 0.114 * parseInt(pdfSettings.backgroundColorAvg.slice(5, 7), 16)) / 255 < 0.5
    : false;
  const txtColor = bgDark ? pdfSettings.textColorLight : pdfSettings.textColorDark;

  const itemsByDate: Record<string, PlanItem[]> = {};
  items.forEach((item) => {
    if (!itemsByDate[item.date]) itemsByDate[item.date] = [];
    itemsByDate[item.date].push(item);
  });
  const sortedDates = Object.keys(itemsByDate).sort();

  return (
    <Document>
      <Page size="A4" orientation={orientation} style={s.page}>
        <BackgroundLayer image={pdfSettings.backgroundImage} opacity={pdfSettings.backgroundOpacity}>
          <View style={s.header}>
            <View>
              <Text style={s.title}>{planTitle}</Text>
              <Text style={s.subtitle}>Aylık Çalışma Özeti - {formattedMonth}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={s.countdownText}>YKS&apos;ye {daysLeft} Gün</Text>
              <Text style={s.subtitle}>Hedef Sınav: {examDateStr}</Text>
            </View>
          </View>

          <Text style={s.sectionTitle}>Aylık Plan Listesi</Text>

          {sortedDates.length === 0 ? (
            <Text style={{ fontSize: 9.5, color: "#94a3b8", marginTop: 25, textAlign: "center" }}>
              Bu ay için planlanmış herhangi bir çalışma bulunmamaktadır.
            </Text>
          ) : (
            <View style={s.table}>
              <View style={s.tableHeader}>
                <Text style={{ width: "22%", paddingLeft: 10, fontSize: 9.5, fontWeight: "bold", color: txtColor }}>Tarih</Text>
                <Text style={{ width: "78%", fontSize: 9.5, fontWeight: "bold", color: txtColor }}>Planlanan Çalışmalar ve Süreler</Text>
              </View>
              {sortedDates.map((dateStr, index) => {
                const dayItems = itemsByDate[dateStr];
                const rowStyle = index % 2 === 0 ? s.tableRow : s.tableRowAlternate;
                return (
                  <View key={dateStr} style={rowStyle}>
                    <View style={{ width: "22%", paddingLeft: 10 }}>
                      <Text style={{ fontSize: 9, fontWeight: "bold", color: "#6366f1" }}>
                        {format(parseISO(dateStr), "d MMMM", { locale: tr })}
                      </Text>
                      <Text style={{ fontSize: 7.5, color: "#94a3b8", marginTop: 2 }}>
                        {format(parseISO(dateStr), "EEEE", { locale: tr })}
                      </Text>
                    </View>
                    <View style={{ width: "78%", display: "flex", flexDirection: "column", gap: 3 }}>
                      {dayItems.map((item) => {
                        const topic = TOPICS_MAP.get(item.topicId);
                        const sc = getSubjectColorsPDF(topic?.subject);
                        return (
                          <View key={item.id} style={{ flexDirection: "row", alignItems: "center" }}>
                            <Text style={{ fontSize: 8.5, color: txtColor }}>• </Text>
                            <Text style={{ fontSize: 7.5, fontWeight: "bold", color: sc.text, backgroundColor: sc.bg, paddingHorizontal: 4, paddingVertical: 1, borderRadius: 3, marginRight: 4, borderWidth: 0.5, borderColor: sc.border }}>
                              {topic?.subject || "-"}
                            </Text>
                            <Text style={{ fontSize: 8, color: txtColor }}>
                              {topic?.name || ""} ({item.durationMinutes} dk) {item.status === "tamamlandi" ? "✓" : ""}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          <View style={s.footer}>
            <Text>YKS Çalışma Planlayıcısı - Aylık Görünüm</Text>
            <Text>Sayfa 1 / 3</Text>
          </View>
        </BackgroundLayer>
      </Page>

      <TopicChecklistPage planTitle={planTitle} examDateStr={examDateStr} track={selectedTrack} pdf={pdfSettings} />
    </Document>
  );
}
