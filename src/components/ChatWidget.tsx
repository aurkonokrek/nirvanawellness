import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

const GREETING: Msg = {
  role: "assistant",
  content:
    "Hello — I'm the Nirvana site guide. I can help you find your way around, understand our offerings, or point you to the right booking path. What brings you here today?",
};

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, sending]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok) {
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content:
              data.error ??
              "The assistant couldn't respond just now. You can also reach us at nirvanawellness.bd@gmail.com.",
          },
        ]);
      } else {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: data.reply || "I'm not sure how to help with that — try /book or /experts." },
        ]);
      }
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: "Connection interrupted. Please try again or email nirvanawellness.bd@gmail.com.",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open site assistant"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-[color:var(--navy)] px-5 py-3 text-sm text-[color:var(--cream)] shadow-lg ring-1 ring-[color:var(--gold-soft)]/40 transition-transform hover:-translate-y-0.5"
        >
          <MessageCircle className="h-4 w-4 text-[color:var(--gold-soft)]" />
          <span className="font-eyebrow">Ask Nirvana</span>
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[560px] max-h-[calc(100vh-3rem)] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border/60 bg-background shadow-2xl">
          <header className="flex items-center justify-between border-b border-border/60 bg-[color:var(--navy)] px-4 py-3 text-[color:var(--cream)]">
            <div>
              <p className="font-eyebrow text-[color:var(--gold-soft)]">Site guide</p>
              <p className="font-display text-lg leading-tight">Ask Nirvana</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close assistant"
              className="rounded-full p-1.5 text-[color:var(--sand)] transition-colors hover:bg-white/10 hover:text-[color:var(--cream)]"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-[color:var(--cream)] px-4 py-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user"
                    ? "ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-[color:var(--navy)] px-3.5 py-2.5 text-sm text-[color:var(--cream)]"
                    : "mr-auto max-w-[90%] whitespace-pre-wrap text-sm leading-relaxed text-foreground"
                }
              >
                {renderWithLinks(m.content)}
              </div>
            ))}
            {sending && (
              <div className="mr-auto flex gap-1 text-[color:var(--stone)]">
                <Dot /> <Dot delay="150ms" /> <Dot delay="300ms" />
              </div>
            )}
          </div>

          <div className="border-t border-border/60 bg-background px-3 pb-3 pt-2">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
                rows={1}
                placeholder="Ask about sessions, experts, retreats…"
                className="max-h-32 flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-[color:var(--gold-deep)] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => void send()}
                disabled={!input.trim() || sending}
                aria-label="Send message"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold-gradient text-[color:var(--navy)] transition-opacity disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 px-1 text-[11px] leading-snug text-muted-foreground">
              This assistant helps with navigating the site and booking — it doesn't provide therapy or medical advice.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

function Dot({ delay = "0ms" }: { delay?: string }) {
  return (
    <span
      className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-current"
      style={{ animationDelay: delay }}
    />
  );
}

function renderWithLinks(text: string) {
  // Turn /path fragments and http(s) URLs and emails into anchors.
  const parts = text.split(/(\s+)/);
  return parts.map((part, i) => {
    if (/^\/[a-z0-9\-/$]+/i.test(part)) {
      return (
        <a key={i} href={part} className="underline decoration-[color:var(--gold-deep)] underline-offset-2 hover:text-[color:var(--navy)]">
          {part}
        </a>
      );
    }
    if (/^https?:\/\//i.test(part)) {
      return (
        <a key={i} href={part} target="_blank" rel="noreferrer" className="underline decoration-[color:var(--gold-deep)] underline-offset-2">
          {part}
        </a>
      );
    }
    if (/^[\w.+-]+@[\w.-]+\.[a-z]{2,}$/i.test(part)) {
      return (
        <a key={i} href={`mailto:${part}`} className="underline decoration-[color:var(--gold-deep)] underline-offset-2">
          {part}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
}
