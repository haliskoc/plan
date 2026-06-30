export function getSubjectColor(subject: string) {
  const colors: Record<string, string> = {
    Matematik: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Geometri: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    Fizik: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    Kimya: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Biyoloji: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    Türkçe: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    Edebiyat: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    Tarih: "bg-red-500/10 text-red-400 border-red-500/20",
    "Tarih-2": "bg-red-500/10 text-red-400 border-red-500/20",
    Coğrafya: "bg-green-500/10 text-green-400 border-green-500/20",
    "Coğrafya-2": "bg-green-500/10 text-green-400 border-green-500/20",
    Felsefe: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20",
    "Felsefe Grubu": "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20",
    "Din Kültürü": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    "Din Kültürü (AYT)": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
  };
  return colors[subject] || "bg-neutral-500/10 text-neutral-400 border-neutral-500/20";
}

