import type { FormatAction } from "@/components/handover/FormattingToolbar";

const wraps: Partial<Record<FormatAction, string>> = {
  bold: "*",
  italic: "_",
  strike: "~",
  inline: "`",
};

export function applyFormat(
  el: HTMLTextAreaElement,
  action: FormatAction,
  setValue: (next: string) => void,
) {
  const value = el.value;
  const start = el.selectionStart;
  const end = el.selectionEnd;
  const selected = value.slice(start, end);

  const wrap = (chars: string, placeholder = "tekst") => {
    const text = selected || placeholder;
    const next = value.slice(0, start) + chars + text + chars + value.slice(end);
    setValue(next);
    requestAnimationFrame(() => {
      el.focus();
      const cursor = selected
        ? start + chars.length + text.length + chars.length
        : start + chars.length;
      el.setSelectionRange(
        selected ? cursor : cursor,
        selected ? cursor : cursor + (selected ? 0 : placeholder.length),
      );
    });
  };

  if (action in wraps) {
    wrap(wraps[action]!);
    return;
  }

  if (action === "mono") {
    const text = selected || "tekst";
    const block = "```\n" + text + "\n```";
    const next = value.slice(0, start) + block + value.slice(end);
    setValue(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + 4;
      el.setSelectionRange(pos, pos + text.length);
    });
    return;
  }

  // line-based: ul, ol, quote
  const lineStart = value.lastIndexOf("\n", start - 1) + 1;
  const lineEnd = value.indexOf("\n", end);
  const blockEnd = lineEnd === -1 ? value.length : lineEnd;
  const block = value.slice(lineStart, blockEnd) || "tekst";
  const lines = block.split("\n");

  const transformed = lines.map((line, i) => {
    if (action === "ul") return `- ${line.replace(/^[-*]\s+/, "")}`;
    if (action === "ol") return `${i + 1}. ${line.replace(/^\d+\.\s+/, "")}`;
    if (action === "quote") return `> ${line.replace(/^>\s?/, "")}`;
    return line;
  }).join("\n");

  const next = value.slice(0, lineStart) + transformed + value.slice(blockEnd);
  setValue(next);
  requestAnimationFrame(() => {
    el.focus();
    el.setSelectionRange(lineStart, lineStart + transformed.length);
  });
}
