"use client";

import { useEffect, useRef, useState } from "react";
import { getSocket } from "@/lib/realtime/client";

interface ChatMessage {
  id: number;
  userId: string | null;
  username: string | null;
  message: string;
  createdAt: string;
}

function chatPrefix(username: string | null): string {
  if (username === "Serkcan") return "ADMIN";
  if (username === "Liouss") return "💎";
  return "💩";
}

export function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/chat")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setMessages(data.messages ?? []);
      });

    const socket = getSocket();
    function onMessage(msg: ChatMessage) {
      setMessages((prev) => [...prev, msg]);
    }
    socket.on("chat:message", onMessage);
    return () => {
      cancelled = true;
      socket.off("chat:message", onMessage);
    };
  }, []);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  async function send() {
    const message = draft.trim();
    if (!message) return;
    setDraft("");
    setSending(true);
    await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    setSending(false);
  }

  return (
    <div className="fixed top-20 right-3 bottom-24 z-30 flex w-56 flex-col rounded-xl border border-border bg-surface/90 backdrop-blur shadow-xl overflow-hidden">
      <div className="px-3 py-2 border-b border-border text-xs uppercase tracking-wide text-muted">
        Chat
      </div>
      <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5 text-sm">
        {messages.map((m) => (
          <p key={m.id} className="break-words leading-snug">
            <span className="font-semibold text-accent-2">
              {chatPrefix(m.username)} {m.username}
            </span>
            <span className="text-muted">: </span>
            <span>{m.message}</span>
          </p>
        ))}
        {messages.length === 0 && <p className="text-muted text-xs">Aucun message.</p>}
      </div>
      <div className="p-2 border-t border-border flex gap-1.5">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
          maxLength={300}
          placeholder="Message…"
          className="flex-1 min-w-0 rounded-lg bg-surface-2 border border-border px-2 py-1.5 text-sm outline-none focus:border-accent"
        />
        <button
          onClick={send}
          disabled={sending || !draft.trim()}
          className="rounded-lg bg-accent px-2.5 py-1.5 text-sm font-semibold disabled:opacity-40"
        >
          ➤
        </button>
      </div>
    </div>
  );
}
