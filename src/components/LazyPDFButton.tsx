"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Lazy-load the PDF components and wrap them in a conditional renderer to prevent background PDF calculations
const LazyDailyPDF = dynamic(() => import("./PlanPDF").then((mod) => {
  const { DailyPDF } = mod;
  const { PDFDownloadLink } = require("@react-pdf/renderer");

  const DailyPDFWrapper = ({ planTitle, examDateStr, dateStr, items, selectedTrack, pdfSettings, fileName, className }: any) => {
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
      setShouldRender(false);
    }, [planTitle, examDateStr, dateStr, items, selectedTrack, pdfSettings, fileName]);

    if (shouldRender) {
      return (
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
              {loading ? (
                <div className="w-3 h-3 border-2 border-neutral-600 border-t-indigo-500 rounded-full animate-spin mr-1.5 inline-block" />
              ) : (
                <span className="w-3.5 h-3.5 inline-block mr-1">⬇</span>
              )}
              <span>{loading ? "Hazırlanıyor..." : "PDF İndir"}</span>
            </>
          )}
        </PDFDownloadLink>
      );
    }

    return (
      <button
        onClick={() => setShouldRender(true)}
        className={className}
      >
        <span className="w-3.5 h-3.5 inline-block mr-1">📄</span>
        <span>PDF Hazırla</span>
      </button>
    );
  };

  return { default: DailyPDFWrapper };
}), { ssr: false });

const LazyWeeklyPDF = dynamic(() => import("./PlanPDF").then((mod) => {
  const { WeeklyPDF } = mod;
  const { PDFDownloadLink } = require("@react-pdf/renderer");

  const WeeklyPDFWrapper = ({ planTitle, examDateStr, selectedDateStr, items, selectedTrack, pdfSettings, fileName, className }: any) => {
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
      setShouldRender(false);
    }, [planTitle, examDateStr, selectedDateStr, items, selectedTrack, pdfSettings, fileName]);

    if (shouldRender) {
      return (
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
              {loading ? (
                <div className="w-3 h-3 border-2 border-neutral-600 border-t-indigo-500 rounded-full animate-spin mr-1.5 inline-block" />
              ) : (
                <span className="w-3.5 h-3.5 inline-block mr-1">⬇</span>
              )}
              <span>{loading ? "Hazırlanıyor..." : "PDF İndir"}</span>
            </>
          )}
        </PDFDownloadLink>
      );
    }

    return (
      <button
        onClick={() => setShouldRender(true)}
        className={className}
      >
        <span className="w-3.5 h-3.5 inline-block mr-1">📄</span>
        <span>PDF Hazırla</span>
      </button>
    );
  };

  return { default: WeeklyPDFWrapper };
}), { ssr: false });

const LazyMonthlyPDF = dynamic(() => import("./PlanPDF").then((mod) => {
  const { MonthlyPDF } = mod;
  const { PDFDownloadLink } = require("@react-pdf/renderer");

  const MonthlyPDFWrapper = ({ planTitle, examDateStr, selectedMonthStr, items, selectedTrack, pdfSettings, fileName, className }: any) => {
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
      setShouldRender(false);
    }, [planTitle, examDateStr, selectedMonthStr, items, selectedTrack, pdfSettings, fileName]);

    if (shouldRender) {
      return (
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
              {loading ? (
                <div className="w-3 h-3 border-2 border-neutral-600 border-t-indigo-500 rounded-full animate-spin mr-1.5 inline-block" />
              ) : (
                <span className="w-3.5 h-3.5 inline-block mr-1">⬇</span>
              )}
              <span>{loading ? "Hazırlanıyor..." : "PDF İndir"}</span>
            </>
          )}
        </PDFDownloadLink>
      );
    }

    return (
      <button
        onClick={() => setShouldRender(true)}
        className={className}
      >
        <span className="w-3.5 h-3.5 inline-block mr-1">📄</span>
        <span>PDF Hazırla</span>
      </button>
    );
  };

  return { default: MonthlyPDFWrapper };
}), { ssr: false });

export { LazyDailyPDF, LazyWeeklyPDF, LazyMonthlyPDF };
