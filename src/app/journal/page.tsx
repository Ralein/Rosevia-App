"use client";

import { useState, useEffect } from "react";
import { 
  BookOpen, 
  Layers, 
  Activity, 
  FolderHeart, 
  AlertCircle, 
  Droplet,
  Moon,
  TrendingUp,
  Brain,
  Coffee,
  CheckCircle,
  Sparkles,
  Loader2,
  Settings
} from "lucide-react";

interface InsightItem {
  type: string;
  title: string;
  desc: string;
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
  const [insights, setInsights] = useState<InsightItem[] | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [theme, setTheme] = useState("Midnight Jade");

  const navigateTo = (path: string) => {
    window.location.href = path;
  };

  useEffect(() => {
    const savedProfile = localStorage.getItem("rosevia_profile");
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setMenstrualSync(parsed.climate === "Moderate" ? true : false); 
    }
    
    const savedToggles = localStorage.getItem("rosevia_system_toggles");
    if (savedToggles) {
      const parsed = JSON.parse(savedToggles);
      setMenstrualSync(parsed.hormoneSync || false);
    }

    const savedTheme = localStorage.getItem("rosevia_theme");
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const getThemeClasses = () => {
    switch (theme) {
      case "Rose Quartz Luxury":
        return {
          bg: "bg-rosevia-plum text-rosevia-charcoal",
          card: "bg-rosevia-rose-dark/85 border border-rosevia-rose-light/40 shadow-[0_4px_30px_rgba(232,193,200,0.12)]",
          accent: "text-rosevia-rose-light",
          gold: "text-rosevia-rosegold",
          button: "bg-rosevia-rose-light text-rosevia-cream hover:bg-rosevia-rosegold",
          glow: "border-rosevia-rosegold/75 shadow-[0_0_20px_rgba(232,193,200,0.2)]"
        };
      case "Polished Obsidian":
        return {
          bg: "bg-black text-[#E6E8E6]",
          card: "bg-neutral-950/80 border border-neutral-800 shadow-[0_4px_25px_rgba(0,0,0,0.85)]",
          accent: "text-neutral-400",
          gold: "text-rosevia-gold",
          button: "bg-neutral-900 border border-neutral-700 hover:border-rosevia-gold text-rosevia-charcoal",
          glow: "border-rosevia-gold/50 shadow-[0_0_15px_rgba(212,175,55,0.06)]"
        };
      case "Liquid Gold Premium":
        return {
          bg: "bg-[#060D0B] text-rosevia-charcoal",
          card: "bg-[#111C18]/85 border border-rosevia-gold/50 shadow-[0_4px_30px_rgba(212,175,55,0.12)]",
          accent: "text-rosevia-rose",
          gold: "text-rosevia-gold",
          button: "bg-rosevia-gold text-rosevia-cream hover:bg-rosevia-rose",
          glow: "border-rosevia-gold/75 shadow-[0_0_20px_rgba(212,175,55,0.2)]"
        };
      case "Midnight Jade":
      default:
        return {
          bg: "bg-rosevia-cream text-rosevia-charcoal",
          card: "glass-card bg-rosevia-sand/70 border border-rosevia-rose/25",
          accent: "text-rosevia-clay",
          gold: "text-rosevia-gold",
          button: "bg-rosevia-clay text-rosevia-cream hover:bg-rosevia-gold",
          glow: "border-rosevia-rose/30 shadow-xs"
        };
    }
  };

  const currentTheme = getThemeClasses();

  const handleDietToggle = (item: string) => {
    if (diet.includes(item)) {
      setDiet(diet.filter((d) => d !== item));
    } else {
      setDiet([...diet, item]);
    }
  };

  const saveDailyLog = () => {
    const dailyLog = {
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

  const fetchRhythmInsights = async () => {
    setLoadingInsights(true);
    setInsights(null);
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "journalInsights",
          dailyLog: {
            water,
            sleep,
            stress,
            diet,
            menstrualPhase: menstrualSync ? menstrualPhase : undefined,
            notes: customNotes
          }
        })
      });
      const data = await response.json();
      if (data.insights) {
        setInsights(data.insights.insights || data.insights);
      }
    } catch (error) {
      console.error("Failed to fetch journal rhythm insights:", error);
    } finally {
      setLoadingInsights(false);
    }
  };

  return (
    <div className={`min-h-screen ${currentTheme.bg} pb-28 select-none transition-colors duration-500`}>
      
      <div className="max-w-4xl mx-auto px-4 pt-6 md:pt-10 flex flex-col space-y-6 animate-fade-in">
        
        {/* Header Title */}
        <header className="flex justify-between items-start">
          <div>
            <h1 className={`text-xs tracking-widest font-bold ${currentTheme.accent} uppercase`}>Biological Rhythm Logger</h1>
            <p className="text-2xl md:text-3xl font-serif tracking-tight font-light mt-1">
              Lifestyle & <span className={`italic ${currentTheme.gold} font-normal`}>Skin Journal</span>
            </p>
          </div>
          
          <button 
            onClick={() => navigateTo("/")}
            className={`w-10 h-10 rounded-full bg-gradient-to-tr from-rosevia-gold/30 to-rosevia-rose/30 border border-rosevia-gold/50 flex items-center justify-center font-serif text-xs font-bold ${currentTheme.gold} hover:shadow-lg transition-all shrink-0 cursor-pointer`}
          >
            RN
          </button>
        </header>

        {/* Dynamic Log forms splits */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Daily Tracker Inputs Panel */}
          <div className={`${currentTheme.card} md:col-span-7 p-5 space-y-6 shadow-sm`}>
            <h3 className={`text-xs font-semibold tracking-widest uppercase ${currentTheme.accent}`}>Log Daily Skin Metrics</h3>

            {/* 1. Interactive Water Glass Tracker */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-semibold text-rosevia-clay">
                <span className="flex items-center"><Droplet size={14} className="mr-1.5 text-blue-400" /> Hydration (Water Glasses)</span>
                <span className={`${currentTheme.gold} font-bold`}>{water} / 8 Glasses</span>
              </div>
              <div className="flex items-center space-x-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setWater(i + 1)}
                    className={`w-8 h-10 rounded-b-lg border-2 border-t-0 flex flex-col items-center justify-end pb-1 text-[9px] font-bold cursor-pointer transition-all duration-300 shadow-xs ${
                      water > i 
                        ? "bg-blue-950/70 border-blue-500/70 text-blue-300 scale-105"
                        : "bg-rosevia-cream/80 border-rosevia-rose/30 text-rosevia-clay/40 hover:border-rosevia-rose/60"
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
                <span className="flex items-center"><Moon size={14} className="mr-1.5 text-indigo-400 animate-pulse" /> Cellular Rest (Sleep Hours)</span>
                <span className={`${currentTheme.gold} font-bold`}>{sleep} Hours</span>
              </div>
              <input
                type="range"
                min="4"
                max="12"
                value={sleep}
                onChange={(e) => setSleep(parseInt(e.target.value))}
                className="w-full accent-rosevia-gold bg-rosevia-cream h-2 rounded-lg cursor-pointer border border-rosevia-rose/25"
              />
              <div className="flex justify-between text-[9px] text-rosevia-clay/60 uppercase font-bold tracking-wider">
                <span>4h (Compromised)</span>
                <span>8h (Ideal Renewal)</span>
                <span>12h (Max recovery)</span>
              </div>
            </div>

            {/* 3. Stress Log Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-semibold text-rosevia-clay">
                <span className="flex items-center"><Brain size={14} className="mr-1.5 text-rosevia-clay" /> Cortisol (Stress Level)</span>
                <span className={`font-bold px-2.5 py-0.5 rounded text-[9px] uppercase border tracking-wider shadow-xs ${
                  stress === "High" 
                    ? "bg-rose-950/20 border-rose-900 text-rose-400" 
                    : stress === "Moderate"
                    ? "bg-amber-950/20 border-amber-900 text-amber-400"
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
                    className={`py-3 px-2 rounded-xl text-xs font-bold border text-center transition-all duration-300 cursor-pointer shadow-xs ${
                      stress === level 
                        ? "bg-rosevia-rose/20 border-rosevia-gold text-rosevia-charcoal font-semibold shadow-xs"
                        : "bg-rosevia-cream/80 border-rosevia-rose/20 hover:border-rosevia-rose/50"
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
                <span className="text-[9px] text-rosevia-clay/60 font-bold uppercase tracking-wider">Select breakout triggers</span>
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
                      className={`flex items-start text-left p-3 rounded-xl transition-all duration-300 border cursor-pointer shadow-xs ${
                        active 
                          ? "bg-rosevia-rose/20 border-rosevia-gold shadow-xs"
                          : "bg-rosevia-cream/80 border-rosevia-rose/20 hover:border-rosevia-rose/50"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center mt-0.5 mr-2.5 shrink-0 transition-all ${
                        active ? "bg-rosevia-gold border-rosevia-gold text-rosevia-cream shadow-xs" : "border-rosevia-rose/50 bg-rosevia-cream"
                      }`}>
                        {active && <CheckCircle size={10} className="stroke-[3]" />}
                      </div>
                      <div>
                        <p className="font-bold text-[11px] text-rosevia-charcoal leading-tight">{item.label}</p>
                        <p className="text-[9px] text-rosevia-clay mt-1 font-semibold leading-relaxed">{item.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Menstrual Phase Sync (conditional field) */}
            {menstrualSync && (
              <div className="space-y-3 border-t border-rosevia-rose/15 pt-4">
                <p className="text-xs font-semibold text-rosevia-clay">Menstrual Phase (Hormone Synchronization)</p>
                <div className="grid grid-cols-2 gap-2">
                  {["Follicular (Glow)", "Ovulatory (Hydrated)", "Luteal (Sebum Spike)", "Menstrual (Dry/Sensitive)"].map((phase) => (
                    <button
                      key={phase}
                      onClick={() => setMenstrualPhase(phase)}
                      className={`py-2 px-3 rounded-xl text-[10px] font-bold border text-center transition-all duration-300 cursor-pointer shadow-xs ${
                        menstrualPhase === phase
                          ? "bg-rosevia-rose/20 border-rosevia-gold text-rosevia-charcoal font-semibold"
                          : "bg-rosevia-cream/80 border-rosevia-rose/20 hover:border-rosevia-rose/50"
                      }`}
                    >
                      {phase}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Custom Notes Text area */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-rosevia-clay">Personal observations</p>
              <textarea
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="Log physical skin flareups, dry itching spots, active hormonal pimples..."
                className="w-full h-20 bg-rosevia-sand border border-rosevia-rose/30 rounded-xl p-3 text-xs focus:ring-1 focus:ring-rosevia-gold focus:outline-none placeholder-rosevia-clay/40 resize-none font-semibold text-rosevia-charcoal shadow-inner"
              />
            </div>

            {/* Save Log Action button */}
            <button
              onClick={saveDailyLog}
              className="w-full py-4 rounded-xl bg-rosevia-gold text-rosevia-cream text-xs tracking-widest font-bold uppercase hover:bg-rosevia-rose transition-all shadow-md cursor-pointer flex items-center justify-center transform hover:-translate-y-0.5"
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
            {loadingInsights ? (
              <div className={`${currentTheme.card} p-6 text-center flex flex-col items-center justify-center space-y-4 aspect-[4/3.5] border border-dashed border-rosevia-rose/50 bg-rosevia-sand/70 shadow-xs animate-pulse`}>
                <div className="w-12 h-12 rounded-full bg-rosevia-rose/25 flex items-center justify-center">
                  <Loader2 size={22} className={`${currentTheme.gold} animate-spin`} />
                </div>
                <h3 className={`text-sm font-serif ${currentTheme.gold} font-bold uppercase tracking-wider`}>Processing rhythms...</h3>
                <p className={`text-xs ${currentTheme.accent} opacity-70 max-w-[200px] leading-relaxed font-semibold`}>
                  Dermatologist AI is running lifestyle-skin regression checks...
                </p>
              </div>
            ) : insights ? (
              <div className={`${currentTheme.card} p-5 space-y-4 border border-rosevia-gold/30 bg-rosevia-rose/10 shadow-sm animate-fade-in`}>
                <div className="flex items-center space-x-2">
                  <Sparkles size={16} className={currentTheme.gold} />
                  <h4 className={`text-xs font-bold tracking-widest uppercase ${currentTheme.accent}`}>Coaching Correlation Insights</h4>
                </div>

                <div className="space-y-3.5">
                  {insights.map((item, index) => (
                    <div key={index} className="bg-rosevia-cream border border-rosevia-rose/25 rounded-xl p-3.5 space-y-1 shadow-xs">
                      <p className={`text-[10px] font-bold flex items-center uppercase tracking-wider ${item.type === "stress" || item.type === "diet" ? "text-rosevia-terracotta" : "text-rosevia-sage"}`}>
                        <AlertCircle size={11} className="mr-1 shrink-0" /> {item.title}
                      </p>
                      <p className="text-[11px] text-rosevia-clay leading-relaxed font-semibold">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setInsights(null)}
                  className="w-full py-2.5 rounded-xl bg-rosevia-cream border border-rosevia-rose/30 text-rosevia-clay text-[10px] font-bold tracking-wider uppercase hover:bg-rosevia-rose/10 cursor-pointer shadow-xs"
                >
                  Close Insights
                </button>
              </div>
            ) : (
              /* Diagnostic Trigger Banner */
              <div className={`${currentTheme.card} p-6 text-center flex flex-col items-center justify-center space-y-4 aspect-[4/3.5] border border-dashed border-rosevia-rose/50 bg-rosevia-sand/70 shadow-xs`}>
                <div className="w-12 h-12 rounded-full bg-rosevia-rose/25 flex items-center justify-center border border-rosevia-gold/30">
                  <TrendingUp size={22} className={`${currentTheme.gold} animate-pulse`} />
                </div>
                <h3 className={`text-sm font-serif ${currentTheme.gold} uppercase tracking-wider`}>Skin Habit Correlations</h3>
                <p className={`text-xs ${currentTheme.accent} opacity-80 leading-relaxed font-semibold`}>
                  Log your water, sleep, stress, and triggers over 7 days. Our AI will run regression algorithms to map which external rhythm trigger breakouts or barrier flushes.
                </p>
                <button
                  onClick={fetchRhythmInsights}
                  className={`py-3 px-5 rounded-xl text-rosevia-cream text-xs font-bold tracking-widest uppercase transition-all shadow cursor-pointer flex items-center transform hover:-translate-y-0.5 ${currentTheme.button}`}
                >
                  Audit My Rhythm Insights <Sparkles size={13} className="ml-1.5 animate-spin duration-3000" />
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* FLOATING BOTTOM PREMIUM NAVIGATION DOCK */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md glass-panel py-3.5 px-6 rounded-2xl flex justify-between items-center shadow-lg border border-rosevia-rose/40 z-50">
        <button 
          onClick={() => navigateTo("/")}
          className="flex flex-col items-center text-rosevia-clay hover:text-rosevia-gold shrink-0 cursor-pointer"
        >
          <Layers size={18} />
          <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">Home</span>
        </button>
        <button 
          onClick={() => navigateTo("/analysis")}
          className="flex flex-col items-center text-rosevia-clay hover:text-rosevia-gold shrink-0 cursor-pointer"
        >
          <Activity size={18} />
          <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">Scan</span>
        </button>
        <button 
          onClick={() => navigateTo("/cabinet")}
          className="flex flex-col items-center text-rosevia-clay hover:text-rosevia-gold shrink-0 cursor-pointer"
        >
          <FolderHeart size={18} />
          <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">Cabinet</span>
        </button>
        <button 
          onClick={() => navigateTo("/checker")}
          className="flex flex-col items-center text-rosevia-clay hover:text-rosevia-gold shrink-0 cursor-pointer"
        >
          <AlertCircle size={18} />
          <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">Checker</span>
        </button>
        <button 
          onClick={() => navigateTo("/journal")}
          className="flex flex-col items-center text-rosevia-gold shrink-0 cursor-pointer"
        >
          <BookOpen size={18} />
          <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">Diary</span>
        </button>
        <button 
          onClick={() => navigateTo("/settings")}
          className="flex flex-col items-center text-rosevia-clay hover:text-rosevia-gold shrink-0 cursor-pointer animate-none"
        >
          <Settings size={18} />
          <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">Settings</span>
        </button>
      </nav>

    </div>
  );
}
