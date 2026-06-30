"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { usePlanStore } from "@/store/usePlanStore";
import { 
  Sparkles, 
  ArrowRight, 
  X, 
  BookOpen, 
  Calendar, 
  BarChart3, 
  Layers, 
  Settings as SettingsIcon,
  HelpCircle,
  Play
} from "lucide-react";

interface OnboardingTourProps {
  mobileTab: "plan" | "library" | "stats";
  setMobileTab: (tab: "plan" | "library" | "stats") => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  activePanel: "recurring" | null;
  setActivePanel: (panel: "recurring" | null) => void;
}

interface TourStep {
  title: string;
  description: string;
  selectorDesktop: string | null;
  selectorMobile: string | null;
  placementDesktop: "top" | "bottom" | "left" | "right" | "center";
  placementMobile: "bottom-sheet" | "center";
  actionBefore?: () => void;
}

export const OnboardingTour = React.memo(function OnboardingTour({
  mobileTab,
  setMobileTab,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  activePanel,
  setActivePanel,
}: OnboardingTourProps) {
  const hasCompletedOnboarding = usePlanStore((s) => s.hasCompletedOnboarding);
  const setHasCompletedOnboarding = usePlanStore((s) => s.setHasCompletedOnboarding);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Define steps
  const steps: TourStep[] = [
    {
      title: "YKS 2027 Odasına Hoş Geldin! 🎉",
      description: "Bu oda sınav hedeflerine yönelik ders programını, çalışma konularını ve takvimini kolayca yönetmen için tasarlandı. Şimdi 1 dakikada sistemi keşfedelim!",
      selectorDesktop: null,
      selectorMobile: null,
      placementDesktop: "center",
      placementMobile: "center",
    },
    {
      title: "Çalışma Programın ve Takvimin 📅",
      description: "Günlük yapılacaklar listesi, haftalık program ve aylık özet takvim arasında geçiş yapabilirsin. Tamamlanan konuları onay kutusundan işaretleyebilir, çalışma sürelerini ve notları güncelleyebilirsin.",
      selectorDesktop: "#tour-planner-views",
      selectorMobile: "#tour-planner-views",
      placementDesktop: "bottom",
      placementMobile: "bottom-sheet",
      actionBefore: () => {
        setMobileTab("plan");
        setIsMobileMenuOpen(false);
      }
    },
    {
      title: "Geniş Konu Kütüphanesi 📚",
      description: "TYT ve AYT sınavlarının tüm güncel müfredat konularını buraya yerleştirdik. Seçtiğin dersin konularını arayarak tek tıkla takvimdeki aktif güne ekleyebilirsin.",
      selectorDesktop: "#tour-topic-selector",
      selectorMobile: "#tour-topic-selector",
      placementDesktop: "right",
      placementMobile: "bottom-sheet",
      actionBefore: () => {
        setMobileTab("library");
        setIsMobileMenuOpen(false);
      }
    },
    {
      title: "Tekrarlayan Dersler 🔁",
      description: "Haftalık düzenli yaptığın çalışmaları (örneğin: her Çarşamba 2 saat Fizik) bir kez buraya tanımlayarak takvimine otomatik işlenmesini sağlayabilirsin.",
      selectorDesktop: "#tour-recurring-btn",
      selectorMobile: "#tour-recurring-btn-mobile",
      placementDesktop: "right",
      placementMobile: "bottom-sheet",
      actionBefore: () => {
        setMobileTab("library");
        setActivePanel("recurring");
        setIsMobileMenuOpen(false);
      }
    },
    {
      title: "Gelişim İstatistiklerin 📊",
      description: "Hangi derse kaç saat çalıştın, haftalık/günlük hedeflerinin yüzde kaçını tamamladın ve kaç konu bitirdin gibi verileri grafiklerle buradan takip et.",
      selectorDesktop: "#tour-stats-tab",
      selectorMobile: "#tour-stats-panel",
      placementDesktop: "right",
      placementMobile: "bottom-sheet",
      actionBefore: () => {
        setMobileTab("stats");
        setIsMobileMenuOpen(false);
      }
    },
    {
      title: "Şablonlar, PDF Defter ve Hızlı İşlemler ⚡",
      description: "Sayısal/Eşit Ağırlık/Sözel şablonları yükleyebilir, çıktısını alabileceğin özel ders çalışma defteri oluşturabilir ve plan ayarlarını yönetebilirsin.",
      selectorDesktop: "#tour-quick-actions",
      selectorMobile: "#tour-mobile-menu-actions",
      placementDesktop: "right",
      placementMobile: "bottom-sheet",
      actionBefore: () => {
        if (window.innerWidth < 1024) {
          setMobileTab("plan");
          setIsMobileMenuOpen(true);
        }
      }
    },
    {
      title: "Yedek Al, Sıfırla ve Geri Al 💾",
      description: "Yaptığın hatalı işlemleri Geri Al butonuyla kurtarabilir, verilerini kaybetmemek için JSON yedeği indirebilirsin. Tüm verilerin tarayıcında saklanır.",
      selectorDesktop: "#tour-backup-actions",
      selectorMobile: "#tour-mobile-menu-backups",
      placementDesktop: "right",
      placementMobile: "bottom-sheet",
      actionBefore: () => {
        if (window.innerWidth < 1024) {
          setMobileTab("plan");
          setIsMobileMenuOpen(true);
        }
      }
    },
    {
      title: "Tebrikler, Artık Hazırsın! 🌟",
      description: "YKS 2027 Çalışma Planlayıcısı'nı başarıyla öğrendin. Şimdi kendi özel planını oluşturup hedefine doğru kararlılıkla çalışmaya başla! Başarılar dileriz.",
      selectorDesktop: null,
      selectorMobile: null,
      placementDesktop: "center",
      placementMobile: "center",
      actionBefore: () => {
        setIsMobileMenuOpen(false);
        setMobileTab("plan");
      }
    }
  ];

  const currentStep = steps[currentStepIndex];

  // Screen width checks
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update visibility
  useEffect(() => {
    if (hasCompletedOnboarding === false) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [hasCompletedOnboarding]);

  // Handle step actions and position tracking
  const updateTargetPosition = useCallback(() => {
    if (!isVisible) return;
    const selector = isMobile ? currentStep.selectorMobile : currentStep.selectorDesktop;
    if (!selector) {
      setTargetRect(null);
      return;
    }

    const element = document.querySelector(selector);
    if (element) {
      setTargetRect(element.getBoundingClientRect());
    } else {
      setTargetRect(null);
    }
  }, [currentStep, isMobile, isVisible]);

  // Execute step setup action and calculate positions
  useEffect(() => {
    if (!isVisible) return;

    if (currentStep.actionBefore) {
      currentStep.actionBefore();
    }

    // Wait a short frame for react state render/layout to settle
    const timer = setTimeout(() => {
      updateTargetPosition();
    }, 150);

    return () => clearTimeout(timer);
  }, [currentStepIndex, isMobile, isVisible, updateTargetPosition]);

  // Sync positions on scroll, resize or DOM changes
  useEffect(() => {
    if (!isVisible) return;

    const handleScrollAndResize = () => {
      updateTargetPosition();
    };

    window.addEventListener("scroll", handleScrollAndResize, true);
    window.addEventListener("resize", handleScrollAndResize);

    // Keep querying periodically in case of animations or lazy loads
    const interval = setInterval(updateTargetPosition, 250);

    return () => {
      window.removeEventListener("scroll", handleScrollAndResize, true);
      window.removeEventListener("resize", handleScrollAndResize);
      clearInterval(interval);
    };
  }, [isVisible, updateTargetPosition]);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      setHasCompletedOnboarding(true);
      setCurrentStepIndex(0);
    }
  }, [currentStepIndex, steps.length, setHasCompletedOnboarding]);

  const handleSkip = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setHasCompletedOnboarding(true);
    setCurrentStepIndex(0);
  }, [setHasCompletedOnboarding]);

  if (!isVisible) return null;

  // Render overlay panels
  const renderOverlays = () => {
    if (!targetRect) {
      // Return single fullscreen backdrop
      return (
        <div 
          onClick={() => handleNext()}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-[998] transition-all duration-300 cursor-pointer"
        />
      );
    }

    const viewportW = typeof window !== "undefined" ? window.innerWidth : 1024;
    const viewportH = typeof window !== "undefined" ? window.innerHeight : 768;

    const top = Math.max(0, targetRect.top);
    const bottom = Math.min(viewportH, targetRect.bottom);
    const left = Math.max(0, targetRect.left);
    const right = Math.min(viewportW, targetRect.right);
    const height = Math.max(0, bottom - top);

    return (
      <>
        {/* Top Overlay Panel */}
        <div 
          onClick={() => handleNext()}
          className="fixed top-0 left-0 right-0 bg-black/70 backdrop-blur-xs z-[998] cursor-pointer"
          style={{ height: top }}
        />
        {/* Bottom Overlay Panel */}
        <div 
          onClick={() => handleNext()}
          className="fixed left-0 right-0 bottom-0 bg-black/70 backdrop-blur-xs z-[998] cursor-pointer"
          style={{ top: bottom }}
        />
        {/* Left Overlay Panel */}
        <div 
          onClick={() => handleNext()}
          className="fixed bg-black/70 backdrop-blur-xs z-[998] cursor-pointer"
          style={{ top: top, left: 0, width: left, height: height }}
        />
        {/* Right Overlay Panel */}
        <div 
          onClick={() => handleNext()}
          className="fixed bg-black/70 backdrop-blur-xs z-[998] cursor-pointer"
          style={{ top: top, left: right, right: 0, height: height }}
        />

        {/* Glow Highlight Ring */}
        <div 
          className="fixed border-2 border-indigo-500 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.6)] z-[999] pointer-events-none transition-all duration-200"
          style={{
            top: top - 2,
            left: left - 2,
            width: right - left + 4,
            height: height + 4,
          }}
        />
      </>
    );
  };

  // Render Arrow Pointer
  const renderArrow = () => {
    if (!targetRect) return null;

    const top = targetRect.top;
    const bottom = targetRect.bottom;
    const left = targetRect.left;
    const right = targetRect.right;
    const midX = left + (right - left) / 2;
    const midY = top + (bottom - top) / 2;

    if (isMobile) {
      // Floating bounce arrow on mobile pointing down or up to target
      const isTargetAtBottom = top > window.innerHeight / 2;
      return (
        <div 
          className="fixed z-[1000] animate-bounce pointer-events-none"
          style={{
            top: isTargetAtBottom ? top - 36 : bottom + 12,
            left: midX - 16,
          }}
        >
          <svg className={`w-8 h-8 text-indigo-400 drop-shadow-[0_2px_10px_rgba(99,102,241,0.8)] ${isTargetAtBottom ? "" : "rotate-180"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      );
    }

    // Desktop directional arrows based on placement
    const placement = currentStep.placementDesktop;
    let arrowStyle: React.CSSProperties = {};
    let rotationClass = "";

    switch (placement) {
      case "right":
        arrowStyle = { top: midY - 16, left: right + 12 };
        rotationClass = "-rotate-90";
        break;
      case "left":
        arrowStyle = { top: midY - 16, left: left - 44 };
        rotationClass = "rotate-95";
        break;
      case "bottom":
        arrowStyle = { top: bottom + 12, left: midX - 16 };
        rotationClass = "rotate-180";
        break;
      case "top":
        arrowStyle = { top: top - 44, left: midX - 16 };
        rotationClass = "";
        break;
      default:
        return null;
    }

    return (
      <div 
        className="fixed z-[1000] animate-pulse pointer-events-none"
        style={arrowStyle}
      >
        <svg className={`w-8 h-8 text-indigo-400 drop-shadow-[0_2px_8px_rgba(99,102,241,0.8)] ${rotationClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    );
  };

  // Calculate desktop tooltip card positioning
  const getCardStyle = (): React.CSSProperties => {
    if (!targetRect || isMobile) return {};

    const placement = currentStep.placementDesktop;
    const margin = 28;
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    const top = targetRect.top;
    const bottom = targetRect.bottom;
    const left = targetRect.left;
    const right = targetRect.right;
    const midX = left + (right - left) / 2;
    const midY = top + (bottom - top) / 2;

    const cardWidth = 320;
    const cardHeight = 200; // estimated max

    switch (placement) {
      case "right":
        return {
          position: "fixed",
          top: Math.max(20, Math.min(viewportH - cardHeight - 20, midY - 100)),
          left: right + margin,
          width: cardWidth,
        };
      case "left":
        return {
          position: "fixed",
          top: Math.max(20, Math.min(viewportH - cardHeight - 20, midY - 100)),
          left: left - cardWidth - margin,
          width: cardWidth,
        };
      case "bottom":
        return {
          position: "fixed",
          top: bottom + margin,
          left: Math.max(20, Math.min(viewportW - cardWidth - 20, midX - cardWidth / 2)),
          width: cardWidth,
        };
      case "top":
        return {
          position: "fixed",
          top: top - cardHeight - margin,
          left: Math.max(20, Math.min(viewportW - cardWidth - 20, midX - cardWidth / 2)),
          width: cardWidth,
        };
      default:
        return {};
    }
  };

  return (
    <div className="font-sans">
      {renderOverlays()}
      {renderArrow()}

      {/* Onboarding Tooltip Card */}
      <div 
        onClick={(e) => e.stopPropagation()} // stop clicks on the card itself from triggers
        className={`z-[1000] bg-neutral-950 border border-neutral-900 shadow-2xl p-5 sm:p-6 transition-all duration-300 ${
          isMobile 
            ? "fixed bottom-0 left-0 right-0 rounded-t-3xl border-t border-neutral-800 pb-[calc(20px+env(safe-area-inset-bottom,0px))]" 
            : targetRect 
              ? "rounded-2xl border border-neutral-850 hover:border-neutral-800" 
              : "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-3xl max-w-md w-[calc(100%-2rem)]"
        }`}
        style={getCardStyle()}
      >
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold tracking-wider uppercase">
            <Sparkles className="w-3 h-3 animate-pulse" />
            <span>Aşama {currentStepIndex + 1} / {steps.length}</span>
          </div>
          <button 
            onClick={handleSkip}
            className="p-1 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-900 transition-all cursor-pointer"
            title="Turu Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-extrabold text-white mb-2 leading-tight tracking-tight">
          {currentStep.title}
        </h3>

        {/* Description */}
        <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-6 font-medium font-sans">
          {currentStep.description}
        </p>

        {/* Actions Footer */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-neutral-900">
          <button
            onClick={handleSkip}
            className="text-xs font-bold text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
          >
            Turu Geç
          </button>

          <button
            onClick={() => handleNext()}
            className="inline-flex items-center gap-1.5 px-4.5 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/15 hover:shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <span>{currentStepIndex === steps.length - 1 ? "Tamamla!" : "Devam"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
});

export default OnboardingTour;
