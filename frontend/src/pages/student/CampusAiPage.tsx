import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from '../../services/api';
import { Bot, Send, Sparkles, User, RefreshCw, AlertCircle } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'USER' | 'ASSISTANT';
  content: string;
}

export const CampusAiPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ASSISTANT',
      content: 'Hello! I am **CampusAI**, your smart university academic assistant. Ask me anything about your attendance, upcoming exams, grades, or tuition fee status!',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQueries = [
    'What is my attendance?',
    'When is my next exam?',
    'What are my latest results?',
    'How can I improve my GPA?',
    'What fees are pending?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'USER',
      content: textToSend,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const data = await apiFetch('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message: textToSend, conversationId }),
      });

      if (data.conversationId) setConversationId(data.conversationId);

      const aiMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'ASSISTANT',
        content: data.reply || 'CampusAI retrieved your response.',
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 2),
          sender: 'ASSISTANT',
          content: `⚠️ **CampusAI Engine Note:** ${err.message || 'The AI service encountered a temporary error. Please try again.'}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col rounded-3xl border border-gray-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
      {/* Top AI Bar */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 shadow-inner">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold flex items-center gap-1.5">
              CampusAI Smart Assistant <Sparkles className="h-4 w-4 text-amber-300 animate-pulse" />
            </h2>
            <p className="text-[11px] text-blue-100">Directly connected to your database records & academic history</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.sender === 'USER' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                msg.sender === 'USER'
                  ? 'bg-blue-600 text-white'
                  : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
              }`}
            >
              {msg.sender === 'USER' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>

            <div
              className={`max-w-xl rounded-2xl p-4 text-xs leading-relaxed ${
                msg.sender === 'USER'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-slate-800 dark:bg-slate-800 dark:text-gray-100 shadow-sm'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <Bot className="h-5 w-5 animate-spin text-blue-600" />
            <span>CampusAI is querying database records...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Queries */}
      <div className="border-t border-gray-100 bg-gray-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/50">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Suggested Questions:</p>
        <div className="flex flex-wrap gap-1.5">
          {suggestedQueries.map((q) => (
            <button
              key={q}
              onClick={() => handleSend(q)}
              className="rounded-full border border-blue-500/30 bg-blue-50/50 px-3 py-1 text-[11px] font-medium text-blue-600 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="border-t border-gray-200 p-4 dark:border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask CampusAI about your attendance, exams, grades, or fees..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 rounded-2xl border border-gray-300 bg-gray-50 py-3 px-4 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-gray-100"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow hover:bg-blue-700 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
