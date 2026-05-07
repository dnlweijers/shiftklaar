import type { ReactNode } from "react";
import { Fragment, createElement } from "react";

// Render WhatsApp markdown-like text into React nodes (for preview only).
// Supports: *bold*, _italic_, ~strike~, `inline`, ```mono```, > quote, lists.

type Token = { type: "text" | "bold" | "italic" | "strike" | "inline"; value: string };

function tokenizeInline(text: string): Token[] {
  const tokens: Token[] = [];
  const re = /(\*[^*\n]+\*|_[^_\n]+_|~[^~\n]+~|`[^`\n]+`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) tokens.push({ type: "text", value: text.slice(last, m.index) });
    const t = m[0];
    if (t.startsWith("*")) tokens.push({ type: "bold", value: t.slice(1, -1) });
    else if (t.startsWith("_")) tokens.push({ type: "italic", value: t.slice(1, -1) });
    else if (t.startsWith("~")) tokens.push({ type: "strike", value: t.slice(1, -1) });
    else tokens.push({ type: "inline", value: t.slice(1, -1) });
    last = m.index + t.length;
  }
  if (last < text.length) tokens.push({ type: "text", value: text.slice(last) });
  return tokens;
}

function renderInline(text: string, keyBase: string): ReactNode[] {
  return tokenizeInline(text).map((tok, i) => {
    const key = `${keyBase}-${i}`;
    switch (tok.type) {
      case "bold":
        return createElement("strong", { key, className: "font-semibold" }, tok.value);
      case "italic":
        return createElement("em", { key, className: "italic" }, tok.value);
      case "strike":
        return createElement("span", { key, className: "line-through" }, tok.value);
      case "inline":
        return createElement(
          "code",
          { key, className: "rounded bg-black/10 dark:bg-white/15 px-1 py-0.5 font-mono text-[0.9em]" },
          tok.value,
        );
      default:
        return createElement(Fragment, { key }, tok.value);
    }
  });
}

export function renderWhatsApp(source: string): ReactNode[] {
  const blocks: ReactNode[] = [];
  const lines = source.split("\n");
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // mono code block
    if (line.trim().startsWith("```")) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        buf.push(lines[i]);
        i++;
      }
      i++; // skip closing
      blocks.push(
        createElement(
          "pre",
          {
            key: `b${key++}`,
            className:
              "my-1 whitespace-pre-wrap rounded-md bg-black/10 dark:bg-white/10 px-2 py-1.5 font-mono text-[0.875em] leading-snug",
          },
          buf.join("\n"),
        ),
      );
      continue;
    }

    // quote
    if (line.startsWith("> ")) {
      const buf: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        buf.push(lines[i].slice(2));
        i++;
      }
      blocks.push(
        createElement(
          "blockquote",
          {
            key: `b${key++}`,
            className:
              "my-1 border-l-[3px] border-emerald-700/60 dark:border-emerald-400/70 pl-2 text-[0.95em] opacity-90",
          },
          buf.map((l, j) => createElement("div", { key: j }, renderInline(l, `q${j}`))),
        ),
      );
      continue;
    }

    // unordered list
    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, ""));
        i++;
      }
      blocks.push(
        createElement(
          "ul",
          { key: `b${key++}`, className: "my-1 list-disc pl-5 space-y-0.5" },
          items.map((it, j) => createElement("li", { key: j }, renderInline(it, `li${j}`))),
        ),
      );
      continue;
    }

    // ordered
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ""));
        i++;
      }
      blocks.push(
        createElement(
          "ol",
          { key: `b${key++}`, className: "my-1 list-decimal pl-5 space-y-0.5" },
          items.map((it, j) => createElement("li", { key: j }, renderInline(it, `oi${j}`))),
        ),
      );
      continue;
    }

    // empty line -> spacer
    if (line.trim() === "") {
      blocks.push(createElement("div", { key: `b${key++}`, className: "h-2" }));
      i++;
      continue;
    }

    blocks.push(
      createElement(
        "div",
        { key: `b${key++}`, className: "leading-relaxed" },
        renderInline(line, `t${key}`),
      ),
    );
    i++;
  }

  return blocks;
}
