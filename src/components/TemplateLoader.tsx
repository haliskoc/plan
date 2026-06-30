"use client";

import React from "react";
import { X, BookOpen, Calculator, PenTool, Flame, CalendarRange } from "lucide-react";
import { usePlanStore } from "@/store/usePlanStore";
import { formatFullDate } from "@/utils/dates";

interface TemplateLoaderProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TemplateLoader = React.memo(function TemplateLoader({ isOpen, onClose }: TemplateLoaderProps) {
  const loadTemplate = usePlanStore((s) => s.loadTemplate);
  const selectedDate = usePlanStore((s) => s.selectedDate);

  if (!isOpen) return null;

  const templates = [
    {
      type: "SAY" as const,
      title: "Sayısal (SAY) Hazırlık",
      icon: Calculator,
      color: "from-blue-500 to-indigo-600",
      bgLight: "bg-blue-500/10 border-blue-500/20 hover:border-blue-500/40",
      description: "TYT konularının tamamı ile AYT Matematik, Geometri, Fizik, Kimya ve Biyoloji derslerinin ileri düzey konularını kapsayan 4 haftalık yoğun çalışma planı.",
      details: "Günde 2 ana oturum (toplam 120-240 dakika), Pazar günleri ise haftalık tekrar ve deneme olarak boş bırakılır."
    },
    {
      type: "EA" as const,
      title: "Eşit Ağırlık (EA) Hazırlık",
      icon: PenTool,
      color: "from-emerald-500 to-teal-600",
      bgLight: "bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40",
      description: "TYT derslerinin tamamı ile AYT Matematik, Geometri, Edebiyat, Tarih-1 ve Coğrafya-1 derslerini dengeli bir biçimde içeren 4 haftalık program.",
      details: "Sayısal ve sözel derslerin gün bazlı dağılımı sayesinde çalışma verimliliğini üst düzeyde tutar."
    },
    {
      type: "SOZ" as const,
      title: "Sözel (SÖZ) Hazırlık",
      icon: BookOpen,
      color: "from-amber-500 to-orange-600",
      bgLight: "bg-amber-500/10 border-amber-500/20 hover:border-amber-500/40",
      description: "TYT dersleri ile birlikte AYT Edebiyat, Tarih-1, Coğrafya-1, Tarih-2, Coğrafya-2, Felsefe Grubu ve Din Kültürü konularını içeren 4 haftalık sözel planı.",
      details: "Okuma, ezber ve kavramsal konuların zihin yormayacak şekilde planlı dağılımını sağlar."
    },
    {
      type: "TYT_YOGUN" as const,
      title: "TYT Temel Odaklı",
      icon: Flame,
      color: "from-pink-500 to-rose-600",
      bgLight: "bg-pink-500/10 border-pink-500/20 hover:border-pink-500/40",
      description: "Yaz dönemi veya ilk dönem çalışmaları için sadece TYT (9. ve 10. sınıf) konularına odaklanan, temel oluşturma amaçlı 4 haftalık program.",
      details: "Tüm alanlardan öğrencilerin kullanabileceği, temel yeterlilik derslerini içeren program."
    }
  ];

  const handleSelectTemplate = (type: "SAY" | "EA" | "SOZ" | "TYT_YOGUN") => {
    if (confirm("Seçilen şablonun planlanan çalışmaları mevcut programınıza eklenecektir. Devam etmek istiyor musunuz?")) {
      loadTemplate(type);
      alert("Şablon başarıyla yüklendi! Sağ taraftaki takviminizden veya günlük listeden kontrol edebilirsiniz.");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
      <div className="bg-neutral-950 border border-neutral-900 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="px-6 py-4 bg-neutral-900/40 border-b border-neutral-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarRange className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">Hazır Ders Programı Yükle</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-900 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
          <div className="mb-6 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
            <h3 className="text-sm font-semibold text-indigo-400 mb-1">Önemli Bilgilendirme</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Şablon yüklediğinizde, ders programı <span className="font-semibold text-white">{formatFullDate(selectedDate)}</span> tarihinden itibaren başlayacak şekilde <span className="font-semibold text-white">4 haftalık (28 gün)</span> olarak otomatik oluşturulur. Pazar günleri haftalık dinlenme/tekrar günü olarak boş bırakılmaktadır. Bu işlem mevcut planınızı silmez, üzerine ekler.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((tpl) => {
              const Icon = tpl.icon;
              return (
                <div
                  key={tpl.type}
                  onClick={() => handleSelectTemplate(tpl.type)}
                  className={`flex flex-col text-left p-5 rounded-2xl border transition-all cursor-pointer hover:scale-[1.01] ${tpl.bgLight}`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-linear-to-tr ${tpl.color} flex items-center justify-center text-white shadow-md`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-white text-base">{tpl.title}</h3>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed mb-4 flex-1">
                    {tpl.description}
                  </p>
                  <div className="text-[11px] text-neutral-500 bg-neutral-900/60 p-3 rounded-xl border border-neutral-850">
                    {tpl.details}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
});
