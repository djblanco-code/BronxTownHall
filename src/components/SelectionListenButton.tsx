import { useEffect, useState } from "react";
import { useTts } from "@/lib/tts-context";
import { Volume2 } from "lucide-react";

/** Floating "Listen to selection" button that appears when the user highlights text. */
export function SelectionListenButton() {
  const { speak } = useTts();
  const [selectedText, setSelectedText] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = () => {
      const sel = window.getSelection();
      const text = sel ? sel.toString().trim() : "";
      // Don't show for tiny selections or selections inside form fields
      if (!text || text.length < 8) {
        setSelectedText("");
        return;
      }
      const node = sel?.anchorNode;
      const el = (node && node.nodeType === 1 ? node : node?.parentElement) as HTMLElement | null;
      if (el?.closest("input, textarea, [contenteditable='true'], [data-tts-ignore]")) {
        setSelectedText("");
        return;
      }
      setSelectedText(text);
    };
    document.addEventListener("selectionchange", handler);
    return () => document.removeEventListener("selectionchange", handler);
  }, []);

  if (!selectedText) return null;

  const preview = selectedText.length > 60 ? selectedText.slice(0, 60) + "…" : selectedText;

  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()} // keep selection
      onClick={() => {
        void speak(selectedText, { title: `Selection: ${preview}` });
      }}
      data-tts-ignore
      className="print-hide fixed app-float-bottom start-4 z-[55] inline-flex items-center gap-2 px-4 py-3 rounded-full bg-primary text-primary-foreground shadow-xl hover:scale-105 transition font-semibold"
      aria-label="Listen to selected text"
    >
      <Volume2 className="h-5 w-5" />
      Listen to selection
    </button>
  );
}
