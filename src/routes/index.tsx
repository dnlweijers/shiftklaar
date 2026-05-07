import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { SectionField } from "@/components/handover/SectionField";
import waBg from "@/assets/whatsapp-bg.png";
import { PreviewModal } from "@/components/handover/PreviewModal";
import { Eye, Copy, Send, Trash2, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

const SECTIONS = [
  {
    key: "start",
    title: "Start van jouw shift",
    question: "Hoe trof je de afdeling aan toen je begon?",
    placeholder: "Bijvoorbeeld: afdeling was netjes, veel lege schappen bij frisdrank...",
  },
  {
    key: "tasks",
    title: "Uitgevoerde taken",
    question: "Welke taken heb je uitgevoerd? Wat viel je op?",
    placeholder: "Bijvoorbeeld: bloemen besteld, gekoelde dranken gevuld...",
  },
  {
    key: "reflection",
    title: "Reflectie",
    question: "Eerlijk stukje",
    placeholder: "Bijvoorbeeld: geen tijd gehad om te vegen door drukte...",
  },
  {
    key: "selfscan",
    title: "Zelfscan & klanten",
    question: "Hoe verliep dit?",
    placeholder: "Bijvoorbeeld: erg druk, veel controles, scanner werkte soms niet...",
  },
  {
    key: "team",
    title: "Samenwerken",
    question: "Hoe verliep de samenwerking met je collega's?",
    placeholder: "Bijvoorbeeld: goede samenwerking met avonddienst...",
  },
] as const;

type State = Record<(typeof SECTIONS)[number]["key"], string>;

const STORAGE_KEY = "shift-handover-v1";

const empty: State = SECTIONS.reduce((acc, s) => ({ ...acc, [s.key]: "" }), {} as State);

function formatDate(d = new Date()) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}-${mm}-${d.getFullYear()}`;
}

function buildMessage(state: State) {
  const body = SECTIONS.map((s, i) => {
    const v = state[s.key].trim();
    if (!v) return null;
    return `*${i + 1}. ${s.title}*\n${v}`;
  })
    .filter(Boolean)
    .join("\n\n");
  if (!body) return "";
  return `📅 ${formatDate()}\n\n${body}`;
}

function isMobile() {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

function Index() {
  const [state, setState] = useState<State>(empty);
  const [hydrated, setHydrated] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...empty, ...JSON.parse(raw) });
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state, hydrated]);

  const message = useMemo(() => buildMessage(state), [state]);
  const hasContent = message.length > 0;

  const updateField = (key: keyof State) => (v: string) =>
    setState((s) => ({ ...s, [key]: v }));

  const copy = async () => {
    if (!hasContent) {
      toast("Nog niets om te kopiëren");
      return;
    }
    try {
      await navigator.clipboard.writeText(message);
      toast.success("Gekopieerd naar klembord");
    } catch {
      toast.error("Kopiëren mislukt");
    }
  };

  const openWhatsApp = () => {
    if (!hasContent) {
      toast("Vul eerst je overdracht in");
      return;
    }
    const encoded = encodeURIComponent(message);
    const url = isMobile()
      ? `whatsapp://send?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const clearAll = () => {
    setState(empty);
    toast("Alles gewist");
  };

  return (
    <main
      className="min-h-screen pb-[max(env(safe-area-inset-bottom),1.5rem)]"
      style={{
        backgroundColor: "#fcf6ea",
      }}
    >
      <div className="mx-auto w-full max-w-[760px] px-4 pt-8 sm:px-6 sm:pt-12">
        <header className="mb-7 flex items-start gap-3 rounded-[12px] border border-border bg-card/95 p-4 shadow-sm backdrop-blur-sm sm:p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-primary/10 text-primary">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium tabular-nums text-muted-foreground">
              {formatDate()}
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[28px]">
              Shift overdracht
            </h1>
            <p className="text-sm text-muted-foreground">
              Vul hieronder jouw overdracht in. De tekst wordt automatisch opgemaakt voor WhatsApp.
            </p>
          </div>
        </header>

        <div className="rounded-[12px] border border-border bg-card p-4 shadow-sm sm:p-6">
          <div className="space-y-7">
            {SECTIONS.map((s, i) => (
              <SectionField
                key={s.key}
                index={i + 1}
                title={s.title}
                question={s.question}
                placeholder={s.placeholder}
                value={state[s.key]}
                onChange={updateField(s.key)}
              />
            ))}
          </div>

          <div className="mt-7 border-t border-border pt-5">
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-[12px] border border-border bg-secondary px-4 py-3 text-sm font-medium text-secondary-foreground transition-colors hover:bg-accent active:scale-[0.99]"
            >
              <Eye className="h-4 w-4" />
              Bekijk voorbeeld
            </button>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={openWhatsApp}
                className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 active:scale-[0.99]"
              >
                <Send className="h-4 w-4" />
                Open in WhatsApp
              </button>
              <button
                type="button"
                onClick={copy}
                className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-border bg-card px-4 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent active:scale-[0.99]"
              >
                <Copy className="h-4 w-4" />
                Kopieer bericht
              </button>
            </div>

            <div className="mt-4 flex justify-center">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[13px] text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Alles wissen
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Hele overdracht wissen?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Alle ingevulde velden worden leeggemaakt. Dit kan niet ongedaan worden gemaakt.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuleren</AlertDialogCancel>
                    <AlertDialogAction onClick={clearAll}>Wissen</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-muted-foreground/80">
          Tip: je tekst wordt automatisch lokaal bewaard.
        </p>
      </div>

      <PreviewModal open={previewOpen} onOpenChange={setPreviewOpen} message={message} />
    </main>
  );
}
