"use client";

import { useState, useEffect } from "react";
import { 
  BookOpen, 
  Layers, 
  Activity, 
  FolderHeart, 
  AlertCircle, 
  MessageSquareHeart, 
  Droplet,
  Moon,
  TrendingUp,
  Brain,
  Coffee,
  CheckCircle,
  Sparkles,
  Heart,
  Users
} from "lucide-react";

interface DailyLog {
  water: number; // glasses
  sleep: number; // hours
  stress: "Low" | "Moderate" | "High";
  diet: string[];
  menstrualPhase?: string;
  notes: string;
}

export default function SkinJournal() {
  const [water, setWater] = useState(3);
  const [sleep, setSleep] = useState(7);
  const [stress, setStress] = useState<"Low" | "Moderate" | "High">("Low");
  const [diet, setDiet] = useState<string[]>([]);
  const [menstrualSync, setMenstrualSync] = useState(false);
  const [menstrualPhase, setMenstrualPhase] = useState("Follicular (Glow)");
  const [customNotes, setCustomNotes] = useState("");
  
  const [isLogged, setIsLogged] = useState(false);
  const [showInsights, setShowInsights] = useState(false);

  const navigateTo = (path: string) => {
    window.location.href = path;
  };

  useEffect(() => {
    // Look up if cycle sync was toggled in home dashboard
    const savedProfile = localStorage.getItem("rosevia_profile");
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setMenstrualSync(parsed.climate === "Moderate" ? true : false); // Mock check
    }
  }, []);

  const handleDietToggle = (item: string) => {
    if (diet.includes(item)) {
      setDiet(diet.filter((d) => d !== item));
    } else {
      setDiet([...diet, item]);
    }
  };

  const saveDailyLog = () => {
    const dailyLog: DailyLog = {
      water,
      sleep,
      stress,
      diet,
      notes: customNotes,
      ...(menstrualSync && { menstrualPhase })
    };
    localStorage.setItem("rosevia_journal_log", JSON.stringify(dailyLog));
    setIsLogged(true);
    setTimeout(() => setIsLogged(false), 2500);
  };

  return (
    <div className="min-h-screen bg-rosevia-cream text-rosevia-charcoal pb-28 select-none">
      
      <div className="max-w-4xl mx-auto px-4 pt-6 md:pt-10 flex flex-col space-y-6 animate-fade-in">
        
        {/* Header Title */}
        <header className="flex justify-between items-start">
          <div>
            <h1 className="text-xs tracking-widest font-bold text-rosevia-clay uppercase">Biological Rhythm Logger</h1>
            <p className="text-2xl md:text-3xl font-serif text-rosevia-charcoal tracking-tight font-light mt-1">
              Lifestyle & <span className="italic text-rosevia-clay font-normal">Skin Journal</span>
            </p>
          </div>
          <div className="px-3 py-1 bg-rosevia-green border border-rosevia-sage/30 rounded-full text-[10px] tracking-wider uppercase font-bold text-rosevia-sage shrink-0">
            Journal Sync: Active
          </div>
        </header>

        {/* Dynamic Log forms splits */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Daily Tracker Inputs Panel */}
          <div className="md:col-span-7 glass-card p-5 space-y-6">
            <h3 className="text-xs font-semibold tracking-widest uppercase text-rosevia-clay">Log Daily Skin Metrics</h3>

            {/* 1. Interactive Water Glass Tracker */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-semibold text-rosevia-clay">
                <span className="flex items-center"><Droplet size={14} className="mr-1.5 text-blue-400" /> Hydration (Water Glasses)</span>
                <span className="text-rosevia-gold font-bold">{water} / 8 Glasses</span>
              </div>
              <div className="flex items-center space-x-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setWater(i + 1)}
                    className={`w-8 h-10 rounded-b-lg border-2 border-t-0 flex flex-col items-center justify-end pb-1 text-[9px] font-bold cursor-pointer transition-all ${
                      water > i 
                        ? "bg-blue-100 border-blue-400 text-blue-500 scale-105"
                        : "bg-white border-rosevia-rose/30 text-rosevia-clay/40"
                    }`}
                  >
                    🥛
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Sleep Hours dial Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-semibold text-rosevia-clay">
                <span className="flex items-center"><Moon size={14} className="mr-1.5 text-indigo-400" /> Cellular Rest (Sleep Hours)</span>
                <span className="text-rosevia-gold font-bold">{sleep} Hours</span>
              </div>
              <input
                type="range"
                min="4"
                max="12"
                value={sleep}
                onChange={(e) => setSleep(parseInt(e.target.value))}
                className="w-full accent-rosevia-gold bg-rosevia-cream h-2 rounded-lg cursor-pointer border border-rosevia-rose/25"
              />
              <div className="flex justify-between text-[9px] text-rosevia-clay/60 uppercase font-semibold">
                <span>4h (Compromised)</span>
                <span>8h (Ideal Renewal)</span>
                <span>12h (Max recovery)</span>
              </div>
            </div>

            {/* 3. Stress Log Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-semibold text-rosevia-clay">
                <span className="flex items-center"><Brain size={14} className="mr-1.5 text-rosevia-clay" /> Cortisol (Stress Level)</span>
                <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase border ${
                  stress === "High" 
                    ? "bg-rose-50 border-rose-200 text-rose-700" 
                    : stress === "Moderate"
                    ? "bg-amber-50 border-amber-200 text-amber-700"
                    : "bg-rosevia-green border-rosevia-sage/35 text-rosevia-sage"
                }`}>
                  {stress} Stress
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(["Low", "Moderate", "High"] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setStress(level)}
                    className={`py-3 px-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                      stress === level 
                        ? "bg-rosevia-rose/25 border-rosevia-gold text-rosevia-charcoal font-semibold shadow-sm"
                        : "bg-white border-rosevia-rose/20 hover:border-rosevia-rose/50"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Trigger Diet checkmarks */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-semibold text-rosevia-clay">
                <span className="flex items-center"><Coffee size={14} className="mr-1.5 text-rosevia-clay" /> Nutritional Triggers (Diet notes)</span>
                <span className="text-[10px] text-rosevia-clay/60 font-medium">Select breakouts triggers</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "Sugar", label: "High Glycemic (Sugar)", desc: "Triggers sebum spikes" },
                  { id: "Dairy", label: "Hormonal Dairy", desc: "Spurs forehead comedones" },
                  { id: "Greasy", label: "Inflammatory Greasy", desc: "Increases capillary redness" },
                  { id: "Gluten", label: "Refined Gluten", desc: "Causes micro-inflammation" }
                ].map((item) => {
                  const active = diet.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleDietToggle(item.id)}
                      className={`flex items-start text-left p-3 rounded-xl transition-all duration-300 border cursor-pointer ${
                        active 
                          ? "bg-rosevia-rose/25 border-rosevia-gold shadow-sm"
                          : "bg-white border-rosevia-rose/20 hover:border-rosevia-rose/50"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center mt-0.5 mr-2.5 shrink-0 transition-all ${
                        active ? "bg-rosevia-gold border-rosevia-gold text-white" : "border-rosevia-rose/50 bg-white"
                      }`}>
                        {active && <CheckCircle size={10} className="stroke-[3]" />}
                      </div>
                      <div>
                        <p className="font-semibold text-[11px] text-rosevia-charcoal leading-tight">{item.label}</p>
                        <p className="text-[9px] text-rosevia-clay/70 mt-0.5">{item.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Custom Notes Text area */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-rosevia-clay">Personal observations</p>
              <textarea
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="Log physical skin flareups, dry itching spots, active hormonal pimples..."
                className="w-full h-20 bg-white border border-rosevia-rose/30 rounded-xl p-3 text-xs focus:ring-1 focus:ring-rosevia-gold focus:outline-none placeholder-rosevia-clay/40 resize-none font-medium text-rosevia-charcoal"
              />
            </div>

            {/* Save Log Action button */}
            <button
              onClick={saveDailyLog}
              className="w-full py-4 rounded-xl bg-rosevia-clay text-rosevia-cream text-xs tracking-widest font-semibold uppercase hover:bg-rosevia-charcoal transition-all shadow-md cursor-pointer flex items-center justify-center"
            >
              {isLogged ? (
                <span className="flex items-center text-rosevia-green font-bold">
                  <CheckCircle size={14} className="mr-1.5 stroke-[3]" /> LOGGED SUCCESSFULLY
                </span>
              ) : (
                "Save Daily Log"
              )}
            </button>
          </div>

          {/* AI Rhythm Habits Correlation Panel */}
          <div className="md:col-span-5 space-y-4">
            
            {/* Correlation analysis display */}
            {showInsights ? (
              <div className="glass-card p-5 space-y-4 border-2 border-rosevia-rose/30 bg-rosevia-rose/10 animate-fade-in">
                <div className="flex items-center space-x-2">
                  <Sparkles size={16} className="text-rosevia-gold" />
                  <h4 className="text-xs font-semibold tracking-widest uppercase text-rosevia-clay">Coaching Correlation Insights</h4>
                </div>

                <div className="space-y-3.5">
                  <div className="bg-white/70 border border-rosevia-rose/25 rounded-xl p-3 space-y-1">
                    <p className="text-[10px] font-bold text-rosevia-terracotta flex items-center">
                      <AlertCircle size={11} className="mr-1" /> Stress-Redness Spike Trigger
                    </p>
                    <p className="text-[11px] text-rosevia-clay/90 leading-relaxed">
                      "Redness flareups and forehead breakouts correlate highly (**84% Pearson index**) with days logged as **High Stress** combined with **sleep under 6 hours** 48 hours prior. On these days, skip exfoliants and double Ceramides."
                    </p>
                  </div>

                  <div className="bg-white/70 border border-rosevia-rose/25 rounded-xl p-3 space-y-1">
                    <p className="text-[10px] font-bold text-rosevia-sage flex items-center">
                      <CheckCircle size={11} className="mr-1 text-rosevia-sage" /> Hydration Glow Factor
                    </p>
                    <p className="text-[11px] text-rosevia-clay/90 leading-relaxed">
                      "Skin hydration ratings increase by 15% when water logging achieves 7+ glasses consecutively for 4 days. This keeps epidermal volume plump and speeds up post-acne mark healing cycles!"
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowInsights(false)}
                  className="w-full py-2.5 rounded-xl bg-white border border-rosevia-rose/30 text-rosevia-clay text-[10px] font-bold tracking-wider uppercase hover:bg-rosevia-rose/10 cursor-pointer"
                >
                  Close Insights
                </button>
              </div>
            ) : (
              /* Diagnostic Trigger Banner */
              <div className="glass-card p-6 text-center flex flex-col items-center justify-center space-y-4 aspect-[4/3.5] border border-dashed border-rosevia-rose/50 bg-white/30">
                <div className="w-12 h-12 rounded-full bg-rosevia-rose/20 flex items-center justify-center">
                  <TrendingUp size={22} className="text-rosevia-clay" />
                </div>
                <h3 className="text-sm font-serif text-rosevia-clay">Skin Habit Correlations</h3>
                <p className="text-xs text-rosevia-clay/80 leading-relaxed">
                  Log your water, sleep, stress, and triggers over 7 days. Our AI will run regression algorithms to map which external rhythm trigger breakouts or barrier flushes.
                </p>
                <button
                  onClick={() => setShowInsights(true)}
                  className="py-3 px-5 rounded-xl bg-rosevia-clay text-rosevia-cream text-xs font-semibold tracking-wider uppercase hover:bg-rosevia-charcoal transition-all shadow cursor-pointer flex items-center"
                >
                  Audit My Rhythm Insights <Sparkles size={13} className="ml-1.5 animate-spin duration-3000" />
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* FLOATING BOTTOM NAVIGATION */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-xl glass-panel py-3 px-4 rounded-2xl flex justify-between items-center shadow-lg border border-rosevia-rose/40 z-50">
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
          className="flex flex-col items-center text-rosevia-clay/70 hover:text-rosevia-clay shrink-0 cursor-pointer"
        >
          <MessageSquareHeart size={18} />
          <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">Chat</span>
        </button>
        <button 
          onClick={() => navigateTo("/journal")}
          className="flex flex-col items-center text-rosevia-gold shrink-0 cursor-pointer"
        >
          <BookOpen size={18} />
          <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">Diary</span>
        </button>
        <button 
          onClick={() => navigateTo("/social")}
          className="flex flex-col items-center text-rosevia-clay/70 hover:text-rosevia-clay shrink-0 cursor-pointer"
        >
          <Users size={18} />
          <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">Friends</span>
        </button>
      </nav>

    </div>
  );
}
