"use client";

let notifiedToday = false;

export function requestNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission === "default") {
    Notification.requestPermission();
  }
}

export function sendStudyReminder() {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  if (notifiedToday) return;

  const now = new Date();
  const hour = now.getHours();

  if (hour >= 8 && hour <= 22) {
    new Notification("📚 Çalışma Zamanı!", {
      body: "Günlük hedeflerini tamamlamak için harika bir zaman. Hadi başla!",
      icon: "/icon-192.png",
      tag: "study-reminder",
      requireInteraction: false,
    });
    notifiedToday = true;
  }
}

export function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("/sw.js").catch(() => {});
}
