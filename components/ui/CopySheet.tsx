"use client";

import { useEffect, useRef } from "react";
import { Button } from "./Button";

interface CopySheetProps {
  visible: boolean;
  text: string;
  onDone: () => void;
}

export function CopySheet({ visible, text, onDone }: CopySheetProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (visible) {
      textareaRef.current?.focus();
      textareaRef.current?.select();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-[rgba(26,15,30,.85)] backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-app flex-col gap-sp-2 rounded-t-[20px] border border-line bg-card p-sp-3">
        <p className="text-meta text-ivory-dim">Copy it yourself — we tried, your browser said no.</p>
        <textarea
          ref={textareaRef}
          readOnly
          rows={5}
          value={text}
          className="w-full resize-none rounded-sm border border-line bg-night-2 p-3 font-sans text-meta leading-normal text-ivory"
        />
        <Button variant="ghost" onClick={onDone}>
          Done
        </Button>
      </div>
    </div>
  );
}
