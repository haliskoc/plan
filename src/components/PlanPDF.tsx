"use client";

import React from "react";
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  Font 
} from "@react-pdf/renderer";
import { PlanItem } from "@/store/usePlanStore";
import { YKS_TOPICS } from "@/data/topics";
import { formatFullDate, formatMonthName } from "@/utils/dates";
import { differenceInDays, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, format } from "date-fns";
import { tr } from "date-fns/locale";

// Register Roboto font for correct Turkish character rendering using local fonts
Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "/fonts/Roboto-Regular.ttf",
      fontWeight: "normal",
    },
    {
      src: "/fonts/Roboto-Bold.ttf",
      fontWeight: "bold",
    }
  ]
});

// Helper to get hex colors for subjects matching the web application design
function getSubjectColorsPDF(subject: string | undefined) {
  if (!subject) return { bg: "#f8fafc", text: "#475569", border: "#e2e8f0" };
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    Matematik: { bg: "#eff6ff", text: "#1d4ed8", border: "#3b82f6" }, // Blue
    Geometri: { bg: "#ecfeff", text: "#0e7490", border: "#06b6d4" }, // Cyan
    Fizik: { bg: "#e0e7ff", text: "#4338ca", border: "#6366f1" }, // Indigo
    Kimya: { bg: "#ecfdf5", text: "#047857", border: "#10b981" }, // Emerald/Green
    Biyoloji: { bg: "#f0fdf4", text: "#15803d", border: "#22c55e" }, // Green
    Türkçe: { bg: "#fffbeb", text: "#b45309", border: "#f59e0b" }, // Amber
    Edebiyat: { bg: "#fff7ed", text: "#c2410c", border: "#f97316" }, // Orange
    Tarih: { bg: "#fff5f5", text: "#b91c1c", border: "#f43f5e" }, // Rose
    "Tarih-2": { bg: "#fef2f2", text: "#dc2626", border: "#ef4444" }, // Red
    Coğrafya: { bg: "#f0fdfa", text: "#0f766e", border: "#14b8a6" }, // Teal
    "Coğrafya-2": { bg: "#f0f9ff", text: "#0369a1", border: "#0ea5e9" }, // Sky
    Felsefe: { bg: "#f5f3ff", text: "#6d28d9", border: "#8b5cf6" }, // Violet
    "Felsefe Grubu": { bg: "#faf5ff", text: "#7e22ce", border: "#a855f7" }, // Purple
    "Din Kültürü": { bg: "#fefce8", text: "#a16207", border: "#eab308" }, // Yellow
    "Din Kültürü (AYT)": { bg: "#f7fee7", text: "#4d7c0f", border: "#84cc16" }, // Lime
  };
  return colors[subject] || { bg: "#f8fafc", text: "#475569", border: "#e2e8f0" };
}

const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    padding: 30,
    backgroundColor: "#ffffff",
  },
  header: {
    borderBottomWidth: 1.5,
    borderBottomColor: "#6366f1", // Indigo 500
    paddingBottom: 12,
    marginBottom: 20,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0f172a", // Slate 900
  },
  subtitle: {
    fontSize: 9,
    color: "#64748b", // Slate 500
    marginTop: 4,
  },
  countdownText: {
    fontSize: 9.5,
    color: "#e11d48", // Rose 600
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 10.5,
    fontWeight: "bold",
    color: "#1e293b", // Slate 800
    marginBottom: 8,
    marginTop: 10,
    backgroundColor: "#f1f5f9", // Slate 100
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  // Table styles
  table: {
    display: "flex",
    flexDirection: "column",
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0", // Slate 200
    borderRadius: 6,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f8fafc", // Slate 50
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingVertical: 8,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingVertical: 8,
    alignItems: "center",
  },
  tableRowAlternate: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingVertical: 8,
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  colCheckbox: {
    width: "8%",
    textAlign: "center",
    fontSize: 9,
    color: "#475569",
  },
  colTopic: {
    width: "42%",
    paddingLeft: 8,
    fontSize: 9,
    color: "#0f172a",
  },
  colSubject: {
    width: "20%",
    fontSize: 9,
    display: "flex",
    flexDirection: "row",
  },
  colDuration: {
    width: "12%",
    textAlign: "center",
    fontSize: 9,
    color: "#0f172a",
    fontWeight: "bold",
  },
  colNote: {
    width: "18%",
    paddingRight: 8,
    fontSize: 8.5,
    color: "#64748b",
  },
  noteBox: {
    marginTop: 25,
    padding: 12,
    backgroundColor: "#f5f3ff", // Indigo 50
    borderLeftWidth: 3,
    borderLeftColor: "#6366f1", // Indigo 500
    borderRadius: 4,
  },
  noteTitle: {
    fontSize: 9.5,
    fontWeight: "bold",
    color: "#4338ca", // Indigo 700
    marginBottom: 4,
  },
  noteText: {
    fontSize: 8.5,
    color: "#4f46e5", // Indigo 600
    lineHeight: 1.4,
  },
  footer: {
    position: "absolute",
    bottom: 25,
    left: 30,
    right: 30,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 8,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 8,
    color: "#94a3b8", // Slate 400
  },
  // Weekly styles (landscape grid helper)
  weeklyGrid: {
    display: "flex",
    flexDirection: "row",
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    minHeight: 330,
    overflow: "hidden",
  },
  weeklyColumn: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: "#e2e8f0",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#ffffff",
  },
  weeklyColumnLast: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#ffffff",
  },
  weeklyDayHeader: {
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingVertical: 8,
    paddingHorizontal: 4,
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  weeklyDayName: {
    fontWeight: "bold",
    fontSize: 9.5,
    color: "#0f172a",
  },
  weeklyDayDate: {
    fontSize: 7.5,
    color: "#64748b",
    marginTop: 2,
  },
  weeklyCardList: {
    padding: 6,
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  weeklyCard: {
    borderLeftWidth: 3,
    borderWidth: 0.5,
    borderStyle: "solid",
    borderColor: "#e2e8f0",
    borderRadius: 4,
    padding: 5,
    marginBottom: 5,
    display: "flex",
    flexDirection: "column",
  },
  weeklyCardText: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#0f172a",
    lineHeight: 1.2,
  },
  weeklyCardSub: {
    fontSize: 7,
    fontWeight: "bold",
    marginTop: 2,
  },
  weeklyCardDuration: {
    fontSize: 7,
    color: "#64748b",
    marginTop: 2,
    fontWeight: "bold",
  },
});

interface BasePDFProps {
  planTitle: string;
  examDateStr: string;
}

// 1. DAILY PDF DOCUMENT
interface DailyPDFProps extends BasePDFProps {
  dateStr: string;
  items: PlanItem[];
}

export function DailyPDF({ planTitle, examDateStr, dateStr, items }: DailyPDFProps) {
  const daysLeft = Math.max(0, differenceInDays(parseISO(examDateStr), new Date()));
  const formattedDate = formatFullDate(dateStr);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{planTitle}</Text>
            <Text style={styles.subtitle}>Günlük Çalışma Planı - {formattedDate}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.countdownText}>{"YKS'ye"} {daysLeft} Gün Kaldı</Text>
            <Text style={styles.subtitle}>Sınav Tarihi: {examDateStr}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Günün Çalışma Maddeleri</Text>

        {items.length === 0 ? (
          <Text style={{ fontSize: 9.5, color: "#64748b", marginTop: 25, textAlign: "center" }}>
            Bugün için planlanmış herhangi bir çalışma bulunmamaktadır.
          </Text>
        ) : (
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.colCheckbox, { fontWeight: "bold" }]}>Durum</Text>
              <Text style={[styles.colTopic, { fontWeight: "bold" }]}>Konu Başlığı</Text>
              <Text style={[styles.colSubject, { fontWeight: "bold", paddingLeft: 4 }]}>Ders</Text>
              <Text style={[styles.colDuration, { fontWeight: "bold" }]}>Süre</Text>
              <Text style={[styles.colNote, { fontWeight: "bold" }]}>Not</Text>
            </View>

            {/* Table Rows */}
            {items.map((item, index) => {
              const topic = YKS_TOPICS.find((t) => t.id === item.topicId);
              const rowStyle = index % 2 === 0 ? styles.tableRow : styles.tableRowAlternate;
              const isDone = item.status === "tamamlandi";
              const subColors = getSubjectColorsPDF(topic?.subject);

              return (
                <View key={item.id} style={rowStyle}>
                  <Text style={styles.colCheckbox}>
                    {isDone ? "[x]" : "[  ]"}
                  </Text>
                  <Text style={styles.colTopic}>{topic?.name || "Bilinmeyen Konu"}</Text>
                  <View style={styles.colSubject}>
                    <Text 
                      style={{ 
                        color: subColors.text, 
                        backgroundColor: subColors.bg,
                        paddingVertical: 2,
                        paddingHorizontal: 6,
                        borderRadius: 3,
                        fontSize: 7.5,
                        fontWeight: "bold",
                        borderWidth: 0.5,
                        borderColor: subColors.border,
                        textAlign: "center",
                      }}
                    >
                      {topic?.subject || "-"}
                    </Text>
                  </View>
                  <Text style={styles.colDuration}>{item.durationMinutes} dk</Text>
                  <Text style={styles.colNote}>{item.note || ""}</Text>
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.noteBox}>
          <Text style={styles.noteTitle}>Planlayıcı Tavsiyesi 💡</Text>
          <Text style={styles.noteText}>
            Her çalışma oturumundan sonra 10-15 dakika mola verin. Çalıştığınız konuların ardından mutlaka soru çözümü yaparak pekiştirin. Yanlış yaptığınız soruların çözümlerini öğrenmeden günü bitirmeyin!
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>YKS Çalışma Planlayıcısı</Text>
          <Text>Sayfa 1 / 1</Text>
        </View>
      </Page>
    </Document>
  );
}

// 2. WEEKLY PDF DOCUMENT
interface WeeklyPDFProps extends BasePDFProps {
  selectedDateStr: string;
  items: PlanItem[];
}

export function WeeklyPDF({ planTitle, examDateStr, selectedDateStr, items }: WeeklyPDFProps) {
  const daysLeft = Math.max(0, differenceInDays(parseISO(examDateStr), new Date()));
  
  // Calculate start and end of week
  const date = parseISO(selectedDateStr);
  const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday
  const end = endOfWeek(date, { weekStartsOn: 1 }); // Sunday
  const days = eachDayOfInterval({ start, end });

  const weekRangeStr = `${format(start, "d MMMM", { locale: tr })} - ${format(end, "d MMMM yyyy", { locale: tr })}`;

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{planTitle}</Text>
            <Text style={styles.subtitle}>Haftalık Ders Çalışma Planı ({weekRangeStr})</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.countdownText}>{"YKS'ye"} {daysLeft} Gün Kaldı</Text>
            <Text style={styles.subtitle}>Hedef Sınav: {examDateStr}</Text>
          </View>
        </View>

        {/* Weekly 7-column Grid */}
        <View style={styles.weeklyGrid}>
          {days.map((day, idx) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const dayItems = items.filter((item) => item.date === dateStr);
            const isLast = idx === 6;

            const dayName = format(day, "EEEE", { locale: tr });
            const dayShortDate = format(day, "d MMM", { locale: tr });

            return (
              <View
                key={dateStr}
                style={isLast ? styles.weeklyColumnLast : styles.weeklyColumn}
              >
                <View style={styles.weeklyDayHeader}>
                  <Text style={styles.weeklyDayName}>{dayName}</Text>
                  <Text style={styles.weeklyDayDate}>{dayShortDate}</Text>
                </View>

                <View style={styles.weeklyCardList}>
                  {dayItems.map((item) => {
                    const topic = YKS_TOPICS.find((t) => t.id === item.topicId);
                    const subjectColors = getSubjectColorsPDF(topic?.subject);
                    return (
                      <View 
                        key={item.id} 
                        style={[
                          styles.weeklyCard, 
                          { 
                            backgroundColor: subjectColors.bg, 
                            borderLeftColor: subjectColors.border 
                          }
                        ]}
                      >
                        <Text style={styles.weeklyCardText}>
                          {topic?.name || "Konu"}
                        </Text>
                        <Text style={[styles.weeklyCardSub, { color: subjectColors.text }]}>
                          {topic?.subject || "Ders"}
                        </Text>
                        <Text style={styles.weeklyCardDuration}>
                          ⏱️ {item.durationMinutes} dk
                        </Text>
                      </View>
                    );
                  })}

                  {dayItems.length === 0 && (
                    <Text style={{ fontSize: 7.5, color: "#94a3b8", textAlign: "center", marginTop: 25 }}>
                      Boş
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>YKS Çalışma Planlayıcısı - Haftalık Görünüm</Text>
          <Text>Sayfa 1 / 1</Text>
        </View>
      </Page>
    </Document>
  );
}

// 3. MONTHLY PDF DOCUMENT
interface MonthlyPDFProps extends BasePDFProps {
  selectedMonthStr: string; // "yyyy-MM" format or ISO date
  items: PlanItem[];
}

export function MonthlyPDF({ planTitle, examDateStr, selectedMonthStr, items }: MonthlyPDFProps) {
  const daysLeft = Math.max(0, differenceInDays(parseISO(examDateStr), new Date()));
  const formattedMonth = formatMonthName(selectedMonthStr);

  // Group items by date for the list
  const itemsByDate: Record<string, PlanItem[]> = {};
  items.forEach((item) => {
    if (!itemsByDate[item.date]) {
      itemsByDate[item.date] = [];
    }
    itemsByDate[item.date].push(item);
  });

  const sortedDates = Object.keys(itemsByDate).sort();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{planTitle}</Text>
            <Text style={styles.subtitle}>Aylık Çalışma Özeti - {formattedMonth}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.countdownText}>{"YKS'ye"} {daysLeft} Gün</Text>
            <Text style={styles.subtitle}>Hedef Sınav: {examDateStr}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Aylık Plan Listesi</Text>

        {sortedDates.length === 0 ? (
          <Text style={{ fontSize: 9.5, color: "#64748b", marginTop: 25, textAlign: "center" }}>
            Bu ay için planlanmış herhangi bir çalışma bulunmamaktadır.
          </Text>
        ) : (
          <View style={styles.table}>
            {/* Header */}
            <View style={styles.tableHeader}>
              <Text style={{ width: "22%", paddingLeft: 10, fontSize: 9.5, fontWeight: "bold", color: "#1e293b" }}>Tarih</Text>
              <Text style={{ width: "78%", fontSize: 9.5, fontWeight: "bold", color: "#1e293b" }}>Planlanan Çalışmalar ve Süreler</Text>
            </View>

            {/* Rows */}
            {sortedDates.map((dateStr, index) => {
              const dayItems = itemsByDate[dateStr];
              const rowStyle = index % 2 === 0 ? styles.tableRow : styles.tableRowAlternate;

              return (
                <View key={dateStr} style={rowStyle}>
                  <View style={{ width: "22%", paddingLeft: 10 }}>
                    <Text style={{ fontSize: 9, fontWeight: "bold", color: "#6366f1" }}>
                      {format(parseISO(dateStr), "d MMMM", { locale: tr })}
                    </Text>
                    <Text style={{ fontSize: 7.5, color: "#64748b", marginTop: 2 }}>
                      {format(parseISO(dateStr), "EEEE", { locale: tr })}
                    </Text>
                  </View>
                  
                  <View style={{ width: "78%", display: "flex", flexDirection: "column", gap: 3 }}>
                    {dayItems.map((item) => {
                      const topic = YKS_TOPICS.find((t) => t.id === item.topicId);
                      const subColors = getSubjectColorsPDF(topic?.subject);
                      return (
                        <View key={item.id} style={{ flexDirection: "row", alignItems: "center" }}>
                          <Text style={{ fontSize: 8.5, color: "#0f172a" }}>• </Text>
                          <Text style={{ 
                            fontSize: 7.5, 
                            fontWeight: "bold", 
                            color: subColors.text, 
                            backgroundColor: subColors.bg, 
                            paddingHorizontal: 4, 
                            paddingVertical: 1, 
                            borderRadius: 3, 
                            marginRight: 4,
                            borderWidth: 0.5,
                            borderColor: subColors.border
                          }}>
                            {topic?.subject || "-"}
                          </Text>
                          <Text style={{ fontSize: 8, color: "#334155" }}>
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

        {/* Footer */}
        <View style={styles.footer}>
          <Text>YKS Çalışma Planlayıcısı - Aylık Görünüm</Text>
          <Text>Sayfa 1 / 1</Text>
        </View>
      </Page>
    </Document>
  );
}
