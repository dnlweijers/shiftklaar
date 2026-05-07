import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { renderWhatsApp } from "@/lib/whatsapp";
import { CheckCheck } from "lucide-react";
import waBg from "@/assets/whatsapp-bg.png";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  message: string;
}

export function PreviewModal({ open, onOpenChange, message }: Props) {
  const time = new Date().toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-md flex-col gap-0 overflow-hidden p-0 rounded-[12px] sm:rounded-[12px]">
        <DialogHeader className="shrink-0 border-b border-border bg-card px-4 py-3">
          <DialogTitle className="text-base font-semibold">Voorbeeld</DialogTitle>
        </DialogHeader>

        <div
          className="flex-1 overflow-y-auto px-3 py-5 sm:px-5"
          style={{
            backgroundColor: "var(--wa-chat-bg)",
            backgroundImage: `url(${waBg})`,
            backgroundSize: "180px auto",
            backgroundRepeat: "repeat",
          }}
        >
          <div className="flex justify-end">
            <div
              className="relative max-w-[85%] rounded-[12px] rounded-tr-[4px] px-3 py-2 shadow-sm"
              style={{
                backgroundColor: "var(--wa-bubble)",
                color: "var(--wa-bubble-foreground)",
              }}
            >
              <div className="text-[14.5px] [word-break:break-word]">
                {message.trim() ? (
                  renderWhatsApp(message)
                ) : (
                  <span className="opacity-60">Nog geen tekst om te tonen…</span>
                )}
              </div>
              <div className="mt-1 flex items-center justify-end gap-1 text-[10.5px] opacity-70">
                <span>{time}</span>
                <CheckCheck className="h-3 w-3" />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
