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
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
