import { Bold, Italic, Strikethrough, Code, Code2, List, ListOrdered, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

export type FormatAction =
  | "bold"
  | "italic"
  | "strike"
  | "mono"
  | "inline"
  | "ul"
  | "ol"
  | "quote";

interface Props {
  onAction: (action: FormatAction) => void;
}

const buttons: { action: FormatAction; icon: React.ComponentType<{ className?: string }>; label: string }[] = [
  { action: "bold", icon: Bold, label: "Vet" },
  { action: "italic", icon: Italic, label: "Cursief" },
  { action: "strike", icon: Strikethrough, label: "Doorhalen" },
  { action: "inline", icon: Code, label: "Inline code" },
  { action: "mono", icon: Code2, label: "Monospace" },
  { action: "ul", icon: List, label: "Opsomming" },
  { action: "ol", icon: ListOrdered, label: "Genummerd" },
  { action: "quote", icon: Quote, label: "Citaat" },
];

export function FormattingToolbar({ onAction }: Props) {
  return (
    <div
      className="flex flex-wrap items-center gap-0.5 rounded-t-[12px] border border-b-0 border-border bg-muted/40 px-1.5 py-1"
      role="toolbar"
      aria-label="Tekstopmaak"
    >
      {buttons.map(({ action, icon: Icon, label }, i) => (
        <div key={action} className="flex items-center">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onAction(action)}
            title={label}
            aria-label={label}
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors",
              "hover:bg-background hover:text-foreground active:scale-95",
            )}
          >
            <Icon className="h-4 w-4" />
          </button>
          {(i === 4) && <span className="mx-1 h-5 w-px bg-border" />}
        </div>
      ))}
    </div>
  );
}
