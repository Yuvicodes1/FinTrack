import { useState, useRef, useEffect } from "react";
import { FaPaperPlane, FaRobot, FaTimes } from "react-icons/fa";
import API from "../services/Api";
import { useAuth } from "../context/AuthContext";

export default function AIChat({ month, onClose }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm your AI finance assistant 👋 I have access to your expense data for this month. Ask me anything — like \"Where am I overspending?\" or \"How can I save more?\"",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMessage = { role: "user", content: trimmed };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      // Send full history (minus the initial greeting) for context
      const historyForApi = updatedMessages
        .slice(1) // skip greeting
        .map(({ role, content }) => ({ role, content }));

      const res = await API.post("/expenses/ai-chat", {
        firebaseUID: user.uid,
        message: trimmed,
        history: historyForApi.slice(0, -1), // exclude current message (sent separately)
        month,
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.reply },
      ]);
    } catch (err) {
      console.error("AI chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I couldn't process that. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full
      bg-white dark:bg-darkCard
      rounded-2xl border border-gray-200 dark:border-darkBorder
      shadow-md overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4
        border-b border-gray-200 dark:border-darkBorder
        bg-lightAccent dark:bg-darkAccent"
      >
        <div className="flex items-center gap-3">
          <FaRobot className="text-white dark:text-black" size={18} />
          <div>
            <p className="text-sm font-bold text-white dark:text-black">
              AI Finance Assistant
            </p>
            <p className="text-xs text-white/70 dark:text-black/60">
              Powered by Claude Haiku
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-white/80 dark:text-black/60 hover:text-white dark:hover:text-black transition"
          >
            <FaTimes size={16} />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-0">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed
                ${msg.role === "user"
                  ? "bg-lightAccent dark:bg-darkAccent text-white dark:text-black rounded-br-none"
                  : "bg-gray-100 dark:bg-darkBg text-lightText dark:text-darkText rounded-bl-none"
                }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-darkBg rounded-2xl rounded-bl-none px-4 py-3">
              <div className="flex gap-1 items-center h-4">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500
                      animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-darkBorder">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your spending..."
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl border text-sm
            bg-white dark:bg-darkBg
            text-lightText dark:text-darkText
            placeholder-gray-400 dark:placeholder-gray-500
            border-gray-300 dark:border-darkBorder
            focus:outline-none focus:ring-2 focus:ring-lightAccent dark:focus:ring-darkAccent
            disabled:opacity-50 transition"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl
            bg-lightAccent dark:bg-darkAccent
            text-white dark:text-black
            hover:scale-105 transition
            disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
          >
            <FaPaperPlane size={14} />
          </button>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">
          Press Enter to send · AI may make mistakes
        </p>
      </div>
    </div>
  );
}