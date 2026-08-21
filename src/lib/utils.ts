import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window === "undefined" || !text) return false;

  if (typeof navigator !== "undefined" && navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn("[copyToClipboard] navigator.clipboard failed, trying legacy fallback:", err);
    }
  }

  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    if (typeof textArea.setAttribute === "function") {
      textArea.setAttribute("readonly", "");
    }
    textArea.style.position = "fixed";
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.width = "2em";
    textArea.style.height = "2em";
    textArea.style.padding = "0";
    textArea.style.border = "none";
    textArea.style.outline = "none";
    textArea.style.boxShadow = "none";
    textArea.style.background = "transparent";

    document.body.appendChild(textArea);
    if (typeof textArea.focus === "function") {
      textArea.focus();
    }
    if (typeof textArea.select === "function") {
      textArea.select();
    }
    if (typeof textArea.setSelectionRange === "function") {
      textArea.setSelectionRange(0, text.length);
    }

    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error("[copyToClipboard] Fallback copy failed:", err);
    return false;
  }
}
