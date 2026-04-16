"use client";

import Image from "next/image";
import { Loader2, Send, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatedBotLogo } from "./animated-bot-logo";

type ChatRole = "user" | "bot";

type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
};

const API_URL =
  "https://umesyaxnkvnpnyhvcopy.supabase.co/functions/v1/starfish-agent";

const SUGGESTIONS = [
  "What insurance services do you offer?",
  "How do I get a quote?",
  "Where is your office located?",
];

function fallbackReply(text: string): string | null {
  const t = text.trim().toLowerCase();
  if (/^(hi|hello|hey)([!.?,\s]|$)/i.test(t) || /^(hi|hello|hey)$/i.test(t)) {
    return "Hello! I’m Clearbot. How can I help you with insurance questions today?";
  }
  if (/\b(thanks?|thank you)\b/.test(t)) {
    return "You’re welcome! Let me know if you need anything else.";
  }
  if (/\b(bye|goodbye|see you)\b/.test(t)) {
    return "Goodbye! We’re here whenever you need us.";
  }
  return null;
}

export function Chatbot() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "bot",
      text: "Hi! I’m Clearbot. Ask me about Clearfork Insurance or tap a suggestion below.",
    },
  ]);
  const listRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    scrollToBottom();
  }, [open, messages, loading, scrollToBottom]);

  const sendText = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || loading) return;

      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        text,
      };
      setMessages((m) => [...m, userMsg]);
      setInput("");
      scrollToBottom();

      const local = fallbackReply(text);
      if (local) {
        setMessages((m) => [
          ...m,
          { id: `b-${Date.now()}`, role: "bot", text: local },
        ]);
        scrollToBottom();
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text }),
        });
        let output =
          "Sorry, I couldn’t process that. Please try again or call (817) 249-8683.";
        if (res.ok) {
          const data = (await res.json()) as { output?: string };
          if (typeof data.output === "string" && data.output.trim()) {
            output = data.output.trim();
          }
        }
        setMessages((m) => [
          ...m,
          { id: `b-${Date.now()}`, role: "bot", text: output },
        ]);
      } catch {
        setMessages((m) => [
          ...m,
          {
            id: `b-${Date.now()}`,
            role: "bot",
            text: "Something went wrong. Please try again in a moment or contact us by phone.",
          },
        ]);
      } finally {
        setLoading(false);
        scrollToBottom();
      }
    },
    [loading, scrollToBottom],
  );

  if (pathname === "/get-a-quote") {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-[999] flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? <X className="h-7 w-7" /> : <AnimatedBotLogo />}
      </button>

      {open && (
        <div
          className="fixed bottom-24 right-6 z-[1000] flex w-[min(100vw-2rem,396px)] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
          style={{ height: 500, maxHeight: "min(500px, calc(100vh - 8rem))" }}
          role="dialog"
          aria-label="Clearbot chat"
        >
          <div className="flex items-center justify-between bg-primary px-4 py-3 text-primary-foreground">
            <span className="text-sm font-semibold">Clearbot</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md p-1 hover:bg-white/15"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div
            ref={listRef}
            className="flex flex-1 flex-col gap-3 overflow-y-auto p-3"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={
                  msg.role === "user"
                    ? "flex justify-end"
                    : "flex justify-start"
                }
              >
                <div
                  className={
                    msg.role === "user"
                      ? "max-w-[85%] rounded-2xl rounded-br-md bg-primary px-3 py-2 text-sm text-primary-foreground"
                      : "max-w-[85%] rounded-2xl rounded-bl-md bg-muted px-3 py-2 text-sm text-foreground"
                  }
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => void sendText(s)}
                    className="rounded-full border border-border bg-background px-3 py-1.5 text-left text-xs text-foreground hover:bg-muted"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-muted px-4 py-3 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                  <span className="text-sm">Thinking…</span>
                </div>
              </div>
            )}
          </div>

          <form
            className="flex gap-2 border-t border-border p-3"
            onSubmit={(e) => {
              e.preventDefault();
              void sendText(input);
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message…"
              className="min-w-0 flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-ring focus-visible:ring-2"
              disabled={loading}
              aria-label="Message"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground disabled:opacity-40"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

          <div className="flex items-center justify-center gap-2 border-t border-border bg-muted/40 px-3 py-2">
            <span className="text-[10px] text-muted-foreground">
              Powered by
            </span>
            <a
              href="https://starfishhealth.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1"
            >
              <Image
                src="/images/getStarfish.svg"
                alt="Starfish"
                width={72}
                height={20}
                className="h-4 w-auto"
              />
            </a>
          </div>
        </div>
      )}
    </>
  );
}
