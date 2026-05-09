import { useState, useRef, useEffect } from "react";
import EmojiPicker, { Theme, EmojiStyle } from "emoji-picker-react";

export function IconPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen(!open)} className="glass-strong w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:ring-gold transition">
        <span className="text-2xl">{value || "✨"}</span>
        <span className="text-sm text-muted-foreground">Click to choose any icon</span>
      </button>
      {open && (
        <div className="absolute z-50 mt-2">
          <EmojiPicker
            theme={Theme.DARK}
            emojiStyle={EmojiStyle.NATIVE}
            onEmojiClick={(e) => { onChange(e.emoji); setOpen(false); }}
            searchPlaceholder="Search any icon…"
            width={320}
            height={400}
          />
        </div>
      )}
    </div>
  );
}
