import { Topic, PlanItem } from "@/store/usePlanStore";
import { YKS_TOPICS } from "./topics";
import { addDays, format, parseISO } from "date-fns";

// Dynamic template generator that maps topics to dates starting from the given date
export function generateTemplateItems(
  track: "SAY" | "EA" | "SOZ" | "TYT_YOGUN",
  startDateStr: string
): PlanItem[] {
  const startDate = parseISO(startDateStr);
  const items: PlanItem[] = [];

  // Filter topics for the template
  let relevantTopics: Topic[] = [];

  if (track === "SAY") {
    // SAY track: TYT (all) + AYT SAY (Fizik, Kimya, Biyoloji) + AYT ORTAK (Matematik, Geometri)
    relevantTopics = YKS_TOPICS.filter(
      (t) =>
        t.examType === "TYT" ||
        (t.examType === "AYT" && (t.track === "SAY" || t.track === "ORTAK"))
    );
  } else if (track === "EA") {
    // EA track: TYT (all) + AYT EA (Edebiyat, Tarih-1, Coğrafya-1) + AYT ORTAK (Matematik, Geometri)
    relevantTopics = YKS_TOPICS.filter(
      (t) =>
        t.examType === "TYT" ||
        (t.examType === "AYT" && (t.track === "EA" || t.track === "ORTAK"))
    );
  } else if (track === "SOZ") {
    // SOZ track: TYT (all) + AYT EA (Edebiyat, Tarih-1, Coğrafya-1) + AYT SOZ (Tarih-2, Coğrafya-2, Felsefe Grubu, Din Kültürü)
    // Note: Sözel students take Edebiyat-Sosyal 1 (EA track) + Sosyal 2 (SOZ track)
    relevantTopics = YKS_TOPICS.filter(
      (t) =>
        t.examType === "TYT" ||
        (t.examType === "AYT" && (t.track === "SOZ" || t.track === "EA"))
    );
  } else if (track === "TYT_YOGUN") {
    // TYT Focus track: Only TYT topics
    relevantTopics = YKS_TOPICS.filter((t) => t.examType === "TYT");
  }

  // Sort by order so we present topics in recommended sequence
  relevantTopics.sort((a, b) => {
    if (a.examType !== b.examType) {
      // TYT first, then AYT
      return a.examType === "TYT" ? -1 : 1;
    }
    // Then by subject
    if (a.subject !== b.subject) {
      return a.subject.localeCompare(b.subject);
    }
    // Then by recommended order
    return a.order - b.order;
  });

  // Distribute topics over 28 days (4 weeks)
  // Let's schedule 2 topics per day
  let topicIndex = 0;
  
  for (let dayOffset = 0; dayOffset < 28; dayOffset++) {
    // Skip Sundays for resting/revision! Very premium study recommendation
    const currentDay = addDays(startDate, dayOffset);
    const dayOfWeek = currentDay.getDay(); // 0 is Sunday
    
    if (dayOfWeek === 0) {
      // Sunday is revision / test day
      // We can add a custom note or just not schedule core new topics
      continue;
    }

    const dateStr = format(currentDay, "yyyy-MM-dd");

    // Assign 2 topics for this study day
    for (let session = 0; session < 2; session++) {
      if (topicIndex >= relevantTopics.length) {
        // If we ran out of topics, loop back (or break)
        topicIndex = 0;
      }
      
      const topic = relevantTopics[topicIndex];
      // Random study time: either 60, 90 or 120 minutes
      const durations = [60, 90, 120];
      const duration = durations[(dayOffset + session) % durations.length];

      items.push({
        id: `template-${track}-${dayOffset}-${session}-${topic.id}`,
        date: dateStr,
        topicId: topic.id,
        durationMinutes: duration,
        status: "yapilacak",
        note: session === 0 ? "Konu anlatımı çalışılacak." : "Soru çözümü yapılacak.",
      });

      topicIndex++;
    }
  }

  return items;
}
