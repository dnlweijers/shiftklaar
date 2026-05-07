import { useRef } from "react";
import { FormattingToolbar } from "./FormattingToolbar";
import { applyFormat } from "@/lib/format";

interface Props {
  index: number;
  title: string;
  question: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}

export function SectionField({ index, title, question, placeholder, value, onChange }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  return (
    <section className="space-y-2">
      <div className="space-y-0.5">
        <h2 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
          {index}. {title}
        </h2>
        <p className="text-[13px] text-muted-foreground">{question}</p>
      </div>

      <div className="rounded-[12px]">
        <FormattingToolbar
          onAction={(a) => ref.current && applyFormat(ref.current, a, onChange)}
        />
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="block w-full resize-y rounded-b-[12px] border border-border bg-card px-3.5 py-3 text-[15px] leading-relaxed text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
        />
        <div className="mt-1 flex justify-end">
          <span className="text-[11px] tabular-nums text-muted-foreground/70">
            {value.length} tekens
          </span>
        </div>
      </div>
    </section>
  );
}
