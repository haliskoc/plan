"use client";

import React, { useState, Suspense } from "react";
import dynamic from "next/dynamic";
import type { PlanItem, PdfSettings } from "@/store/usePlanStore";

// Lazy-load the entire PDF module (including @react-pdf/renderer) only when needed
const LazyDailyPDF = dynamic(() => import("./PlanPDF").then((mod) => {
  const { DailyPDF } = mod;
  const { PDFDownloadLink } = require("@react-pdf/renderer");
  return { default: ({ planTitle, examDateStr, dateStr, items, selectedTrack, pdfSettings, fileName, className }: any) => (
    <PDFDownloadLink
      document={
        <DailyPDF
          planTitle={planTitle}
          examDateStr={examDateStr}
          dateStr={dateStr}
          items={items}
          selectedTrack={selectedTrack}
          pdfSettings={pdfSettings}
        />
      }
      fileName={fileName}
      className={className}
    >
      {({ loading }: { loading: boolean }) => (
        <>
          <span className="w-3.5 h-3.5 inline-block">⬇</span>
          <span>{loading ? "Hazırlanıyor..." : "PDF İndir"}</span>
        </>
      )}
    </PDFDownloadLink>
  )};
}), { ssr: false });

const LazyWeeklyPDF = dynamic(() => import("./PlanPDF").then((mod) => {
  const { WeeklyPDF } = mod;
  const { PDFDownloadLink } = require("@react-pdf/renderer");
  return { default: ({ planTitle, examDateStr, selectedDateStr, items, selectedTrack, pdfSettings, fileName, className }: any) => (
    <PDFDownloadLink
      document={
        <WeeklyPDF
          planTitle={planTitle}
          examDateStr={examDateStr}
          selectedDateStr={selectedDateStr}
          items={items}
          selectedTrack={selectedTrack}
          pdfSettings={pdfSettings}
        />
      }
      fileName={fileName}
      className={className}
    >
      {({ loading }: { loading: boolean }) => (
        <>
          <span className="w-3.5 h-3.5 inline-block">⬇</span>
          <span>{loading ? "Hazırlanıyor..." : "PDF İndir"}</span>
        </>
      )}
    </PDFDownloadLink>
  )};
}), { ssr: false });

const LazyMonthlyPDF = dynamic(() => import("./PlanPDF").then((mod) => {
  const { MonthlyPDF } = mod;
  const { PDFDownloadLink } = require("@react-pdf/renderer");
  return { default: ({ planTitle, examDateStr, selectedMonthStr, items, selectedTrack, pdfSettings, fileName, className }: any) => (
    <PDFDownloadLink
      document={
        <MonthlyPDF
          planTitle={planTitle}
          examDateStr={examDateStr}
          selectedMonthStr={selectedMonthStr}
          items={items}
          selectedTrack={selectedTrack}
          pdfSettings={pdfSettings}
        />
      }
      fileName={fileName}
      className={className}
    >
      {({ loading }: { loading: boolean }) => (
        <>
          <span className="w-3.5 h-3.5 inline-block">⬇</span>
          <span>{loading ? "Hazırlanıyor..." : "PDF İndir"}</span>
        </>
      )}
    </PDFDownloadLink>
  )};
}), { ssr: false });

export { LazyDailyPDF, LazyWeeklyPDF, LazyMonthlyPDF };
