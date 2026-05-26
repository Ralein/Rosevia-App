"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Send, 
  Sparkles, 
  Layers, 
  Activity, 
  FolderHeart, 
  AlertCircle, 
  MessageSquareHeart, 
  BookOpen,
  Info,
  Loader2
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function SkinChat() {
  const [profile, setProfile] = useState<any>(null);
  const [routine, setRoutine] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const navigateTo = (path: string) => {
    window.location.href = path;
  };

  useEffect(() => {
    const savedProfile = localStorage.getItem("rosevia_profile");
    const savedRoutine = localStorage.getItem("rosevia_routine");
    
    if (savedProfile && savedRoutine) {
      setProfile(JSON.parse(savedProfile));
      setRoutine(JSON.parse(savedRoutine));
    } else {
      setProfile({ skinType: "Combination", concerns: ["Acne"], age: "25-39" });
      setRoutine({ routineName: "Clear & Balance Cycle" });
    }

    setMessages([
      {
        role: "assistant",
        content: "Greetings! I am your Rosevia skin companion. I have reviewed your current AM/PM routine and skin concerns. How can I assist your skincare journey today? Ask me about ingredient compatibility, active purging, or layering timers!"
      }
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage: Message = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];
    
    setMessages(updatedMessages);
    setInputValue("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat",
          messages: updatedMessages,
          userProfile: {
            skinType: profile?.skinType || "Combination",
            concerns: profile?.concerns || ["Acne"],
            routineName: routine?.routineName || "Clear & Balance Cycle",
            currentStreak: 4
          }
        })
      });
      const data = await response.json();
      
      if (data.reply) {
        setMessages([...updatedMessages, data.reply]);
      }
    } catch (error) {
      console.error("Chat completion error:", error);
      setMessages([
        ...updatedMessages,
        { role: "assistant", content: "Apologies, I encountered a slight cellular disconnect from my primary servers. Try typing again!" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };

  return (
    <div className="min-h-screen bg-rosevia-cream text-rosevia-charcoal pb-28 flex flex-col justify-between select-none">
      
      <div className="max-w-4xl mx-auto px-4 pt-6 md:pt-10 flex-1 flex flex-col space-y-6 w-full animate-fade-in">
        
        {/* Header Title */}
        <header className="flex justify-between items-start">
          <div>
            <h1 className="text-xs tracking-widest font-bold text-rosevia-clay uppercase">Personal AI Dermatologist</h1>
            <p className="text-2xl md:text-3xl font-serif text-rosevia-charcoal tracking-tight font-light mt-1">
              AI Skincare <span className="italic text-rosevia-clay font-normal">Chat Assistant</span>
            </p>
          </div>
          <div className="px-3 py-1 bg-rosevia-gold/15 border border-rosevia-gold/30 rounded-full text-[10px] tracking-wider uppercase font-bold text-rosevia-clay shrink-0">
            Derm-Response Active
          </div>
        </header>

        {/* Dynamic Professional Virtual Assistant Card */}
        <div className="glass-card p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-3.5">
            {/* Visual Medical Clinic Avatar */}
            <div className="relative w-11 h-11 rounded-full bg-rosevia-rose/30 flex items-center justify-center border border-rosevia-gold/30 shrink-0">
              <span className="font-serif text-xs font-bold text-rosevia-clay">Dr. R</span>
              {/* Active Pulsing green light */}
              <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-bold text-rosevia-charcoal leading-none">Dr. Rosevia Nova</p>
              <p className="text-[9px] text-rosevia-clay/65 font-bold uppercase mt-1 tracking-wider">Clinical Dermal AI Consultant</p>
            </div>
          </div>
          <div className="hidden sm:block text-[10px] text-rosevia-clay/70 font-semibold bg-rosevia-cream border border-rosevia-rose/25 px-2.5 py-1 rounded-md">
            Profile Sync: Checked
          </div>
        </div>

        {/* Sync Indicator Info Card */}
        <div className="bg-white/55 border border-rosevia-rose/20 rounded-xl p-3 flex items-center space-x-2 text-[10px] text-rosevia-clay leading-relaxed shadow-xs font-semibold">
          <Info size={14} className="text-rosevia-gold shrink-0" />
          <p>
            Connected to biological skin profile: <span className="font-bold text-rosevia-charcoal">{profile?.skinType || "Combination"}</span> | Concerns: <span className="font-bold text-rosevia-charcoal">{profile?.concerns?.join(", ") || "Acne"}</span>.
          </p>
        </div>

        {/* Conversational Screen */}
        <div className="flex-1 glass-card border border-rosevia-rose/30 bg-white/40 flex flex-col justify-between h-[450px] overflow-hidden rounded-2xl shadow-sm">
          
          {/* Scrollable message thread */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 fade-bottom">
            {messages.map((m, idx) => (
              <div 
                key={idx}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
              >
                <div 
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-xs ${
                    m.role === "user"
                      ? "bg-rosevia-clay text-rosevia-cream rounded-tr-none font-medium"
                      : "bg-white border border-rosevia-rose/25 text-rosevia-charcoal rounded-tl-none font-medium"
                  }`}
                >
                  <p className="whitespace-pre-line">{m.content}</p>
                </div>
              </div>
            ))}

            {/* Typing Loader Indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-rosevia-rose/25 rounded-2xl rounded-tl-none p-3.5 flex items-center space-x-1.5 shrink-0 shadow-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-rosevia-gold animate-bounce" />
                  <div className="w-1.5 h-1.5 rounded-full bg-rosevia-gold animate-bounce delay-150" />
                  <div className="w-1.5 h-1.5 rounded-full bg-rosevia-gold animate-bounce delay-300" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Chip Shelf */}
          <div className="p-3 border-t border-rosevia-rose/20 bg-rosevia-cream/50 flex space-x-2 overflow-x-auto whitespace-nowrap scrollbar-none">
            {[
              "Why am I breaking out?",
              "Retinol peeling advice?",
              "Vitamin C morning use?",
              "Ceramide barrier restore?"
            ].map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleQuickPrompt(prompt)}
                disabled={loading}
                className="text-[10px] font-bold px-3.5 py-1.5 rounded-full bg-white border border-rosevia-rose/25 hover:border-rosevia-gold cursor-pointer transition-all duration-300 text-rosevia-clay shrink-0 disabled:opacity-50 shadow-xs"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Form Input box */}
          <div className="p-3 md:p-4 border-t border-rosevia-rose/25 bg-white flex items-center gap-2 shadow-xs">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage(inputValue)}
              placeholder="Ask Rosevia anything about active layers..."
              disabled={loading}
              className="flex-1 bg-rosevia-cream/40 border border-rosevia-rose/25 rounded-xl px-4 py-3.5 text-xs focus:ring-1 focus:ring-rosevia-gold focus:outline-none placeholder-rosevia-clay/40 font-medium text-rosevia-charcoal disabled:opacity-50"
            />
            <button
              onClick={() => handleSendMessage(inputValue)}
              disabled={loading || !inputValue.trim()}
              className="p-3.5 rounded-xl bg-rosevia-clay text-rosevia-cream hover:bg-rosevia-charcoal transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center shrink-0 shadow"
            >
              <Send size={14} />
            </button>
          </div>

        </div>

      </div>

      {/* FLOATING BOTTOM NAVIGATION (SPACED FOR 6 ITEMS) */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md glass-panel py-3.5 px-6 rounded-2xl flex justify-between items-center shadow-lg border border-rosevia-rose/40 z-50">
        <button 
          onClick={() => navigateTo("/")}
          className="flex flex-col items-center text-rosevia-clay/70 hover:text-rosevia-clay shrink-0 cursor-pointer"
        >
          <Layers size={18} />
          <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">Home</span>
        </button>
        <button 
          onClick={() => navigateTo("/analysis")}
          className="flex flex-col items-center text-rosevia-clay/70 hover:text-rosevia-clay shrink-0 cursor-pointer"
        >
          <Activity size={18} />
          <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">Scan</span>
        </button>
        <button 
          onClick={() => navigateTo("/cabinet")}
          className="flex flex-col items-center text-rosevia-clay/70 hover:text-rosevia-clay shrink-0 cursor-pointer"
        >
          <FolderHeart size={18} />
          <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">Cabinet</span>
        </button>
        <button 
          onClick={() => navigateTo("/checker")}
          className="flex flex-col items-center text-rosevia-clay/70 hover:text-rosevia-clay shrink-0 cursor-pointer"
        >
          <AlertCircle size={18} />
          <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">Checker</span>
        </button>
        <button 
          onClick={() => navigateTo("/chat")}
          className="flex flex-col items-center text-rosevia-gold shrink-0 cursor-pointer"
        >
          <MessageSquareHeart size={18} />
          <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">Chat</span>
        </button>
        <button 
          onClick={() => navigateTo("/journal")}
          className="flex flex-col items-center text-rosevia-clay/70 hover:text-rosevia-clay shrink-0 cursor-pointer"
        >
          <BookOpen size={18} />
          <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">Diary</span>
        </button>
      </nav>

    </div>
  );
}
