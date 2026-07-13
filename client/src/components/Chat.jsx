import { useEffect, useRef, useState } from "react";
import { apiFetch } from "../api/client";
import { useAuth } from "../context/AuthContext";

const POLL_INTERVAL_MS = 4000;

function formatTime(ts) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(ts));
}

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  async function fetchMessages() {
    try {
      const data = await apiFetch("/messages");
      setMessages(data.messages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMessages();
    pollRef.current = setInterval(fetchMessages, POLL_INTERVAL_MS);
    return () => clearInterval(pollRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    const content = input.trim();
    if (!content) return;
    setSending(true);
    setError("");
    try {
      const data = await apiFetch("/messages", { method: "POST", body: { content } });
      setMessages((prev) => [...prev, data.message]);
      setInput("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 flex flex-col h-[calc(100vh-140px)]">
      <div className="mb-4">
        <p className="font-mono text-xs tracking-widest text-brass uppercase">Members' lounge</p>
        <h1 className="font-display text-3xl mt-2">Chat</h1>
        <p className="text-muted text-sm mt-1">
          Visible to every signed-in member. Messages are automatically removed after 30 days.
        </p>
      </div>

      <div className="flex-1 min-h-0 bg-panel border border-hairline rounded-2xl shadow-card flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {loading && <p className="text-muted text-sm font-mono">Loading messages…</p>}
          {!loading && messages.length === 0 && (
            <p className="text-muted text-sm">No messages yet — be the first to say something.</p>
          )}

          {messages.map((m) => {
            const isMine = m.userId === user?.id;
            return (
              <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] ${isMine ? "items-end" : "items-start"} flex flex-col`}>
                  {!isMine && (
                    <span className="text-xs font-mono text-emerald mb-1 px-1">{m.userName}</span>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      isMine
                        ? "bg-brass text-obsidian rounded-br-sm"
                        : "bg-panel2 text-parchment rounded-bl-sm border border-hairline"
                    }`}
                  >
                    {m.content}
                  </div>
                  <span className="text-[11px] font-mono text-muted mt-1 px-1">{formatTime(m.createdAt)}</span>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="border-t border-hairline p-3 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Write a message…"
            className="flex-1 bg-obsidian border border-hairline rounded-full px-4 py-2.5 text-sm text-parchment focus:outline-none focus:ring-2 focus:ring-brass/60"
          />
          <button
            type="submit"
            disabled={sending}
            className="bg-brass text-obsidian font-semibold px-5 py-2.5 rounded-full text-sm hover:bg-brass-light transition disabled:opacity-60"
          >
            Send
          </button>
        </form>
      </div>

      {error && <p className="text-red-300 text-sm mt-3">{error}</p>}
    </div>
  );
}
