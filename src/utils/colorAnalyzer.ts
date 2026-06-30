"use client";

export interface ImageAnalysis {
  dominantColor: string;    // hex e.g. "#1a1a2e"
  isDark: boolean;          // true if background should use light text
  textColor: string;        // recommended text for this bg
  lightTextColors: string[]; // 2-4 alternative light colors
  darkTextColors: string[];  // 2-4 alternative dark colors
}

export function analyzeImageColor(dataUrl: string): Promise<ImageAnalysis> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const size = 50;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, size, size);

      const imageData = ctx.getImageData(0, 0, size, size);
      const pixels = imageData.data;

      let totalR = 0, totalG = 0, totalB = 0;
      const count = pixels.length / 4;

      for (let i = 0; i < pixels.length; i += 4) {
        totalR += pixels[i];
        totalG += pixels[i + 1];
        totalB += pixels[i + 2];
      }

      const avgR = Math.round(totalR / count);
      const avgG = Math.round(totalG / count);
      const avgB = Math.round(totalB / count);

      const luminance = (0.299 * avgR + 0.587 * avgG + 0.114 * avgB) / 255;
      const isDark = luminance < 0.5;

      const hex = "#" + [avgR, avgG, avgB].map((c) => c.toString(16).padStart(2, "0")).join("");

      const lightTextColors = ["#ffffff", "#f0f0f0", "#e8e8ff", "#fff8e8"];
      const darkTextColors = ["#0f172a", "#1e293b", "#1a1a2e", "#0d1117"];

      resolve({
        dominantColor: hex,
        isDark,
        textColor: isDark ? lightTextColors[0] : darkTextColors[0],
        lightTextColors,
        darkTextColors,
      });
    };
    img.onerror = () => {
      resolve({
        dominantColor: "#ffffff",
        isDark: false,
        textColor: "#0f172a",
        lightTextColors: ["#ffffff", "#f0f0f0", "#e8e8ff", "#fff8e8"],
        darkTextColors: ["#0f172a", "#1e293b", "#1a1a2e", "#0d1117"],
      });
    };
    img.src = dataUrl;
  });
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Resize to max 1200x800 to prevent huge memory usage
      resizeDataUrl(reader.result as string, 1200, 800)
        .then(resolve)
        .catch(() => resolve(reader.result as string));
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Resize a data URL image to fit within maxWidth×maxHeight, JPEG 70% quality */
function resizeDataUrl(dataUrl: string, maxWidth: number, maxHeight: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { naturalWidth: w, naturalHeight: h } = img;
      if (w <= maxWidth && h <= maxHeight) {
        resolve(dataUrl); // Already small enough
        return;
      }
      const ratio = Math.min(maxWidth / w, maxHeight / h);
      w = Math.round(w * ratio);
      h = Math.round(h * ratio);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };
    img.onerror = () => reject(new Error("Resize failed"));
    img.src = dataUrl;
  });
}

export function urlToDataUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      new URL(url);
    } catch {
      reject(new Error("Geçersiz URL"));
      return;
    }

    const isLocal = url.startsWith("/") || 
                    url.startsWith("data:") || 
                    (typeof window !== "undefined" && url.startsWith(window.location.origin));

    const finalUrl = isLocal ? url : `/api/proxy-image?url=${encodeURIComponent(url)}`;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      // Constrain to max 1200×800 to prevent huge memory usage
      const maxW = 1200;
      const maxH = 800;
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      if (w > maxW || h > maxH) {
        const ratio = Math.min(maxW / w, maxH / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);
      try {
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      } catch {
        reject(new Error("Resim CORS nedeniyle okunamadı. Farklı bir URL deneyin."));
      }
    };
    img.onerror = () => reject(new Error("Resim yüklenemedi. URL'yi kontrol edin."));
    img.src = finalUrl;
  });
}
