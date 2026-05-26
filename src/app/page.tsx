"use client";

import { useState, useEffect } from "react";
import { 
  Sparkles, 
  Flame, 
  Sun, 
  Moon, 
  Wind, 
  Activity, 
  Droplet, 
  Layers, 
  Clock, 
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Award,
  ChevronRight,
  TrendingUp,
  MapPin,
  Heart,
  BookOpen,
  FolderHeart,
  MessageSquareHeart,
  Check,
  Zap
} from "lucide-react";
import confetti from "canvas-confetti";

interface Routine {
  routineName: string;
  focus: string;
  weeklyCycle: Record<string, { am: string[]; pm: string[] }>;
  tips: string[];
}

interface Profile {
  skinType: string;
  concerns: string[];
  climate: string;
  age: string;
  experience: string;
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [activeDay, setActiveDay] = useState<string>("monday");
  const [streak, setStreak] = useState<number>(3);
  const [completedAM, setCompletedAM] = useState<boolean>(false);
  const [completedPM, setCompletedPM] = useState<boolean>(false);
  
  // Environmental simulator state
  const [climateSim, setClimateSim] = useState<string>("Seoul"); 
  
  // Hormonal cycle sync state
  const [cycleSync, setCycleSync] = useState<boolean>(false);
  const [cyclePhase, setCyclePhase] = useState<string>("Follicular (Glow)");

  const navigateTo = (path: string) => {
    window.location.href = path;
  };

  useEffect(() => {
    setMounted(true);
    const savedProfile = localStorage.getItem("rosevia_profile");
    const savedRoutine = localStorage.getItem("rosevia_routine");
    
    if (savedProfile && savedRoutine) {
      setProfile(JSON.parse(savedProfile));
      setRoutine(JSON.parse(savedRoutine));
    }

    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const currentDay = days[new Date().getDay()];
    setActiveDay(currentDay);

    const savedStreak = localStorage.getItem("rosevia_streak");
    if (savedStreak) {
      setStreak(parseInt(savedStreak));
    }
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-rosevia-cream flex items-center justify-center">
        <LoaderSpinner />
      </div>
    );
  }

  // 1. GORGEOUS LANDING SPLASH IF NOT ONBOARDED
  if (!profile || !routine) {
    return (
      <div className="min-h-screen bg-rosevia-cream text-rosevia-charcoal flex flex-col justify-between p-6 md:p-12 relative overflow-hidden select-none">
        {/* Soft background decor */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-rosevia-rose/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-rosevia-gold/10 blur-[100px]" />

        {/* Premium Navbar */}
        <header className="flex justify-between items-center z-10">
          <div className="flex items-center space-x-2">
            <span className="font-serif text-3xl tracking-widest text-rosevia-clay uppercase font-semibold">Rosevia</span>
          </div>
          <span className="text-xs tracking-widest text-rosevia-gold font-bold uppercase">Skin Wellness AI</span>
        </header>

        {/* Main hero area */}
        <main className="max-w-4xl mx-auto my-auto flex flex-col items-center text-center z-10 space-y-8 pt-12">
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full border border-rosevia-rose/55 bg-white/60 text-rosevia-clay text-[10px] tracking-widest uppercase font-bold shadow-sm">
              <Sparkles size={12} className="text-rosevia-gold animate-pulse mr-1" />
              <span>Great skin is consistent, not complicated</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-serif text-rosevia-charcoal tracking-tight leading-tight">
              The premium path to <br />
              <span className="italic text-rosevia-clay font-light">radiant, timeless</span> skin.
            </h1>
            <p className="text-sm md:text-lg text-rosevia-clay/80 max-w-xl mx-auto leading-relaxed">
              We analyze your facial biology, cross-reference ingredient conflicts, adjust for climate UV, and build your bespoke clinical routines. You show up. Rosevia figures out the rest.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-4 items-center justify-center w-full">
            <button
              onClick={() => navigateTo("/quiz")}
              className="w-full sm:w-auto px-8 py-5 rounded-full text-xs font-bold tracking-widest uppercase bg-rosevia-clay text-rosevia-cream hover:bg-rosevia-charcoal shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center cursor-pointer transform hover:-translate-y-0.5"
            >
              Consult Our AI & Build Cycle <ChevronRight size={14} className="ml-2" />
            </button>
          </div>

          {/* Premium Value Props Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full pt-16">
            {[
              { title: "Intelligent Layouts", desc: "Strict application order & wait-times" },
              { title: "Conflict Scanning", desc: "Avoid active acid cell stress" },
              { title: "AI Selfie Analysis", desc: "Track weekly clinical skin index" },
              { title: "Climate Adaptive", desc: "Updates for UV, humidity, & hormones" }
            ].map((prop, idx) => (
              <div key={idx} className="bg-white/45 border border-rosevia-rose/25 rounded-2xl p-5 text-center glass-panel shadow-sm">
                <p className="text-xs font-bold text-rosevia-clay tracking-wider uppercase">{prop.title}</p>
                <p className="text-[10px] text-rosevia-clay/70 mt-1.5 leading-relaxed">{prop.desc}</p>
              </div>
            ))}
          </div>
        </main>

        <footer className="text-center text-[10px] tracking-widest text-rosevia-clay/60 z-10 mt-12 font-semibold">
          © {new Date().getFullYear()} ROSEVIA CLINICAL. ALL RIGHTS RESERVED.
        </footer>
      </div>
    );
  }

  const activeRoutineDetails = routine.weeklyCycle[activeDay] || { am: [], pm: [] };

  const triggerCompletion = (type: "am" | "pm") => {
    if (type === "am") {
      setCompletedAM(true);
    } else {
      setCompletedPM(true);
    }

    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.8 },
      colors: ["#FAF7F2", "#EAD2C6", "#C5A880", "#8C6D58"]
    });

    const newStreak = streak + 1;
    setStreak(newStreak);
    localStorage.setItem("rosevia_streak", newStreak.toString());
  };

  // Environment modifier tips with ambient background styles
  const getEnvironmentalTips = () => {
    switch (climateSim) {
      case "Seoul":
        return {
          title: "Cold & Dry Wind Warning",
          desc: "Seoul relative humidity has dropped to 28%. Trans-epidermal water loss is elevated. We recommend adding a secondary hydration lock: apply Hyaluronic Acid to slightly damp skin, wait 2 minutes, and seal with a lipid-rich Ceramide cream.",
          uv: "Low (1)",
          humidity: "28%",
          temp: "6°C",
          adjust: "Moisture Heavy",
          ambientBg: "from-blue-50/80 via-indigo-50/40 to-white/90 border-indigo-200/50 shadow-indigo-100/30",
          accentColor: "text-indigo-600 bg-indigo-100/60"
        };
      case "Miami":
        return {
          title: "Hot & Humid Sebum Nudge",
          desc: "Miami relative humidity is high (84% RH). Sebaceous gland activity is accelerated. Skip heavy occlusive lotions today. Switch to a lightweight matte water-gel, and ensure a thorough clinical double-cleanse tonight to melt sweat lipids.",
          uv: "Extreme (9)",
          humidity: "84%",
          temp: "31°C",
          adjust: "Matte & Clean",
          ambientBg: "from-teal-50/80 via-emerald-50/40 to-white/90 border-teal-200/50 shadow-teal-100/30",
          accentColor: "text-emerald-600 bg-emerald-100/60"
        };
      case "Sydney":
        return {
          title: "Critical UV Index Warning",
          desc: "Sydney UV index is currently at a critical 11. Solar radiation is aggressively splitting dermal collagen cells. SPF 50 reapplication is mandatory every 2 hours! Apply Vitamin C underneath your sunscreen to boost antioxidant defense.",
          uv: "Index 11 (Critical)",
          humidity: "50%",
          temp: "27°C",
          adjust: "SPF Boosted",
          ambientBg: "from-amber-50/80 via-orange-50/40 to-white/90 border-amber-200/50 shadow-amber-100/30",
          accentColor: "text-amber-600 bg-amber-100/60"
        };
      case "London":
      default:
        return {
          title: "Particulate Pollution Warning",
          desc: "London relative air quality is compromised with elevated PM2.5 particulate matter. Ensure a double cleanse tonight to pull atmospheric carbon compounds from pores, and apply Niacinamide in your AM layout to form a protective shield.",
          uv: "Moderate (3)",
          humidity: "65%",
          temp: "15°C",
          adjust: "Antioxidant Rich",
          ambientBg: "from-violet-50/80 via-slate-100/60 to-white/90 border-slate-200/60 shadow-slate-100/30",
          accentColor: "text-violet-600 bg-violet-100/60"
        };
    }
  };

  const env = getEnvironmentalTips();

  return (
    <div className="min-h-screen bg-rosevia-cream text-rosevia-charcoal pb-28 select-none">
      
      {/* Header Profile Panel */}
      <div className="max-w-4xl mx-auto px-4 pt-6 md:pt-10 flex flex-col space-y-6">
        <header className="flex justify-between items-start">
          <div>
            <h1 className="text-xs tracking-widest font-bold text-rosevia-clay uppercase">Welcome to Your Path</h1>
            <p className="text-2xl md:text-3xl font-serif text-rosevia-charcoal tracking-tight font-light mt-1">
              Consistency is key, <span className="italic text-rosevia-clay font-normal">Glow on.</span>
            </p>
          </div>

          {/* Streak Badge with premium warm gold glow */}
          <div className="flex items-center space-x-2.5 px-4 py-2 rounded-full bg-rosevia-rose/30 border border-rosevia-rose/40 shadow-sm hover:shadow transition-all duration-300">
            <Flame size={16} className="text-rosevia-gold fill-rosevia-gold animate-bounce" />
            <span className="text-xs font-bold text-rosevia-clay">{streak} Day Streak</span>
          </div>
        </header>

        {/* Current Active Cycle Info Card */}
        <div className="glass-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] w-[30%] h-[120%] bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none transform rotate-12" />
          <div className="space-y-1">
            <span className="text-[9px] tracking-widest font-bold uppercase text-rosevia-gold px-2.5 py-1 bg-white border border-rosevia-rose/40 rounded-md shadow-xs">
              Active Cycle
            </span>
            <h2 className="text-xl font-serif text-rosevia-clay mt-2.5 font-bold">
              {routine.routineName}
            </h2>
            <p className="text-xs text-rosevia-clay/85 mt-1 leading-relaxed max-w-xl font-medium">
              Focus: {routine.focus}
            </p>
          </div>
          <div className="flex items-center space-x-4 border-t md:border-t-0 md:border-l border-rosevia-rose/20 pt-3 md:pt-0 md:pl-6 shrink-0 w-full md:w-auto">
            <div className="text-center">
              <p className="text-[9px] tracking-widest uppercase font-bold text-rosevia-clay/55">Skin Type</p>
              <p className="text-xs font-bold text-rosevia-clay mt-0.5">{profile.skinType}</p>
            </div>
            <div className="h-6 w-px bg-rosevia-rose/25" />
            <div className="text-center">
              <p className="text-[9px] tracking-widest uppercase font-bold text-rosevia-clay/55">Goal</p>
              <p className="text-xs font-bold text-rosevia-clay mt-0.5">{profile.concerns[0]}</p>
            </div>
          </div>
        </div>

        {/* Environmental & Hormonal Intelligence Hub */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* 1. Climate Simulator Widget with Dynamic Ambient Styling */}
          <div className={`border p-6 rounded-2xl transition-all duration-500 bg-gradient-to-br ${env.ambientBg} shadow-sm space-y-4`}>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div className="flex items-center space-x-2">
                <MapPin size={16} className="text-rosevia-clay" />
                <h3 className="text-xs font-bold tracking-widest uppercase text-rosevia-clay">Climate Intelligence</h3>
              </div>
              <div className="flex bg-white/70 rounded-lg p-0.5 border border-rosevia-rose/30 self-start">
                {["Seoul", "Miami", "Sydney", "London"].map((city) => (
                  <button
                    key={city}
                    onClick={() => setClimateSim(city)}
                    className={`text-[9px] font-bold px-2.5 py-1 rounded transition-all duration-300 cursor-pointer ${
                      climateSim === city 
                        ? "bg-rosevia-clay text-rosevia-cream shadow-xs"
                        : "text-rosevia-clay/70 hover:text-rosevia-clay"
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated Weather Metrics */}
            <div className="grid grid-cols-3 gap-2 bg-white/80 border border-rosevia-rose/20 rounded-xl p-3 text-center shadow-xs">
              <div>
                <p className="text-[9px] tracking-wider uppercase font-bold text-rosevia-clay/60">UV Index</p>
                <p className="text-xs font-bold text-rosevia-clay mt-0.5">{env.uv}</p>
              </div>
              <div>
                <p className="text-[9px] tracking-wider uppercase font-bold text-rosevia-clay/60">Humidity</p>
                <p className="text-xs font-bold text-rosevia-clay mt-0.5">{env.humidity}</p>
              </div>
              <div>
                <p className="text-[9px] tracking-wider uppercase font-bold text-rosevia-clay/60">Recommendation</p>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${env.accentColor}`}>
                  {env.adjust}
                </span>
              </div>
            </div>

            {/* Smart Environmental Adaptive Tip */}
            <div className="bg-white/85 border-l-2 border-rosevia-gold p-3.5 rounded-r-xl shadow-xs">
              <p className="text-[10px] font-bold text-rosevia-clay flex items-center">
                <AlertCircle size={12} className="mr-1.5 text-rosevia-gold shrink-0" /> {env.title}
              </p>
              <p className="text-[11px] text-rosevia-clay/85 mt-1 leading-relaxed font-medium">
                {env.desc}
              </p>
            </div>
          </div>

          {/* 2. Hormonal Cycle Sync Widget with Elegant Biological Dial */}
          <div className="glass-card p-6 flex flex-col justify-between space-y-4 shadow-sm">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Heart size={16} className="text-rosevia-clay" />
                <h3 className="text-xs font-bold tracking-widest uppercase text-rosevia-clay">Hormonal Sync</h3>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={cycleSync} 
                  onChange={(e) => setCycleSync(e.target.checked)} 
                  className="sr-only peer" 
                />
                <div className="w-9 h-5 bg-rosevia-rose/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rosevia-clay"></div>
                <span className="ml-2.5 text-[9px] font-bold text-rosevia-clay/80 uppercase">
                  {cycleSync ? "Sync Active" : "Sync Off"}
                </span>
              </label>
            </div>

            {cycleSync ? (
              <div className="space-y-3.5 animate-fade-in flex-1 flex flex-col justify-center">
                {/* SVG Biological Cycle Progress Dial */}
                <div className="flex items-center justify-between bg-white/50 border border-rosevia-rose/25 rounded-xl p-3.5 shadow-xs">
                  <div className="flex items-center space-x-3">
                    <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
                      <svg className="absolute w-full h-full transform -rotate-90">
                        <circle cx="18" cy="18" r="14" stroke="#EAD2C6" strokeWidth="2.5" fill="transparent" opacity="0.3" />
                        <circle 
                          cx="18" 
                          cy="18" 
                          r="14" 
                          stroke="#C5A880" 
                          strokeWidth="2.5" 
                          fill="transparent" 
                          strokeDasharray={88}
                          strokeDashoffset={
                            cyclePhase.startsWith("Luteal") ? 30 : cyclePhase.startsWith("Menstrual") ? 60 : 10
                          } 
                        />
                      </svg>
                      <Zap size={11} className="text-rosevia-gold" />
                    </div>
                    <div>
                      <p className="text-[9px] tracking-wider uppercase font-bold text-rosevia-clay/60">Current Phase</p>
                      <select 
                        value={cyclePhase} 
                        onChange={(e) => setCyclePhase(e.target.value)}
                        className="text-xs font-bold text-rosevia-clay bg-transparent border-0 focus:ring-0 focus:outline-none p-0 cursor-pointer"
                      >
                        <option value="Follicular (Glow)">Follicular (Glow Phase)</option>
                        <option value="Luteal (Barrier Protection)">Luteal (Barrier Protection)</option>
                        <option value="Menstrual (Calming)">Menstrual (Calming Care)</option>
                      </select>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-rosevia-gold" />
                </div>

                <div className="bg-rosevia-green border-l-2 border-rosevia-sage p-3.5 rounded-r-xl shadow-xs">
                  <p className="text-[10px] font-bold text-rosevia-sage uppercase tracking-wider">
                    {cyclePhase.startsWith("Luteal") 
                      ? "High Progesterone Phase" 
                      : cyclePhase.startsWith("Menstrual") 
                      ? "Low Estrogen Reset" 
                      : "Peak Estrogen Recovery"}
                  </p>
                  <p className="text-[11px] text-rosevia-clay/85 mt-1 leading-relaxed font-medium">
                    {cyclePhase.startsWith("Luteal") 
                      ? "High progesterone increases sebum. Skin is prone to acne congestion. We have buffered your PM actives with soothing Centella to keep pores calm."
                      : cyclePhase.startsWith("Menstrual")
                      ? "Estrogen falls, yielding flakiness and dry barriers. Exfoliants are decreased. Focus strictly on Hyaluronic hydration and moisture recovery."
                      : "Estrogen climbs and collagen spikes! Skin barrier is at its peak resilience. It is the perfect week to introduce high-concentration Vitamin C or Retinol."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-5 border border-dashed border-rosevia-rose/40 rounded-2xl bg-white/20">
                <HelpCircle size={24} className="text-rosevia-rose/85 mb-2" />
                <p className="text-xs font-bold text-rosevia-clay/80 uppercase tracking-wider">Integrate Hormonal Syncing</p>
                <p className="text-[10px] text-rosevia-clay/60 mt-1 max-w-[200px] leading-relaxed font-medium">
                  Adapt routines to biological hormone cycles to buffer micro-breakouts before they occur.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Day of Week Selector */}
        <div className="flex items-center justify-between border-b border-rosevia-rose/25 pb-2 pt-4">
          <h3 className="text-xs font-bold tracking-widest uppercase text-rosevia-clay">
            Routine Schedule
          </h3>
          <div className="flex space-x-1">
            {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`w-8 h-8 text-[10px] font-bold rounded-full flex items-center justify-center uppercase transition-all duration-300 cursor-pointer ${
                  activeDay === day 
                    ? "bg-rosevia-clay text-rosevia-cream shadow"
                    : "text-rosevia-clay/60 hover:text-rosevia-clay bg-white border border-rosevia-rose/20"
                }`}
              >
                {day.substring(0, 1)}
              </button>
            ))}
          </div>
        </div>

        {/* Routine Checklists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* AM Routine Checklist */}
          <div className="glass-card p-6 flex flex-col justify-between space-y-5 shadow-sm">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Sun size={18} className="text-rosevia-gold animate-spin duration-10000" />
                <h4 className="text-sm font-serif font-bold text-rosevia-clay uppercase tracking-wider">AM Protective Ritual</h4>
              </div>
              <span className="text-[9px] font-bold tracking-wider uppercase bg-rosevia-rose/35 px-2.5 py-1 rounded text-rosevia-clay">
                {activeRoutineDetails.am.length} Layers
              </span>
            </div>

            <div className="space-y-3.5 flex-1">
              {activeRoutineDetails.am.map((product, idx) => (
                <div 
                  key={idx}
                  className="flex items-start bg-white/60 border border-rosevia-rose/20 rounded-xl p-3.5 hover:border-rosevia-gold/40 transition-all shadow-xs"
                >
                  <div className="w-6 h-6 rounded-full border border-rosevia-rose/60 bg-rosevia-cream flex items-center justify-center shrink-0 mt-0.5 mr-3.5 text-[10px] font-bold text-rosevia-clay shadow-xs">
                    {idx + 1}
                  </div>
                  <div>
                    <p className={`text-xs font-bold text-rosevia-charcoal ${completedAM ? "line-through text-rosevia-clay/45" : ""}`}>
                      {product}
                    </p>
                    <p className="text-[10px] text-rosevia-clay/70 mt-1 font-medium leading-relaxed">
                      {product.includes("Cleans") ? "Lather onto damp face, wash off with lukewarm water." :
                       product.includes("Vit") || product.includes("Niacin") ? "Pat 3 drops into skin, wait 2 minutes." :
                       product.includes("SPF") ? "Apply two-finger lengths as final protective lock." :
                       "Apply evenly and tap gently to aid cellular absorption."}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {completedAM ? (
              <div className="bg-rosevia-green border border-rosevia-sage/40 rounded-xl p-4 text-center flex items-center justify-center space-x-2 shadow-xs">
                <Award size={16} className="text-rosevia-sage" />
                <span className="text-xs font-bold text-rosevia-sage uppercase tracking-wider">AM Skincare Completed</span>
              </div>
            ) : (
              <button
                onClick={() => triggerCompletion("am")}
                className="w-full py-4 rounded-xl bg-rosevia-clay text-rosevia-cream text-xs tracking-widest font-bold uppercase hover:bg-rosevia-charcoal shadow hover:shadow-md transition-all duration-300 cursor-pointer flex items-center justify-center"
              >
                Log AM Completed <Check size={14} className="ml-2 stroke-[3]" />
              </button>
            )}
          </div>

          {/* PM Routine Checklist */}
          <div className="glass-card p-6 flex flex-col justify-between space-y-5 shadow-sm">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Moon size={18} className="text-rosevia-clay" />
                <h4 className="text-sm font-serif font-bold text-rosevia-clay uppercase tracking-wider">PM Restorative Ritual</h4>
              </div>
              <span className="text-[9px] font-bold tracking-wider uppercase bg-rosevia-rose/35 px-2.5 py-1 rounded text-rosevia-clay">
                {activeRoutineDetails.pm.length} Layers
              </span>
            </div>

            <div className="space-y-3.5 flex-1">
              {activeRoutineDetails.pm.map((product, idx) => (
                <div 
                  key={idx}
                  className="flex items-start bg-white/60 border border-rosevia-rose/20 rounded-xl p-3.5 hover:border-rosevia-gold/40 transition-all shadow-xs"
                >
                  <div className="w-6 h-6 rounded-full border border-rosevia-rose/60 bg-rosevia-cream flex items-center justify-center shrink-0 mt-0.5 mr-3.5 text-[10px] font-bold text-rosevia-clay shadow-xs">
                    {idx + 1}
                  </div>
                  <div>
                    <p className={`text-xs font-bold text-rosevia-charcoal ${completedPM ? "line-through text-rosevia-clay/45" : ""}`}>
                      {product}
                    </p>
                    <p className="text-[10px] text-rosevia-clay/70 mt-1 font-medium leading-relaxed">
                      {product.includes("Salic") || product.includes("Glycol") || product.includes("Retin") ? (
                        <span className="text-rosevia-terracotta font-semibold flex items-center mt-0.5">
                          <Clock size={10} className="mr-1" /> Active Layer — Wait 5 minutes before sealing.
                        </span>
                      ) : product.includes("Cleans") ? (
                        "Double cleanse: 1 min oil wash, 1 min water lather."
                      ) : (
                        "Tap over active layers to form an emollient moisture seal."
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {completedPM ? (
              <div className="bg-rosevia-green border border-rosevia-sage/40 rounded-xl p-4 text-center flex items-center justify-center space-x-2 shadow-xs">
                <Award size={16} className="text-rosevia-sage" />
                <span className="text-xs font-bold text-rosevia-sage uppercase tracking-wider">PM Skincare Completed</span>
              </div>
            ) : (
              <button
                onClick={() => triggerCompletion("pm")}
                className="w-full py-4 rounded-xl bg-rosevia-clay text-rosevia-cream text-xs tracking-widest font-bold uppercase hover:bg-rosevia-charcoal shadow hover:shadow-md transition-all duration-300 cursor-pointer flex items-center justify-center"
              >
                Log PM Completed <Check size={14} className="ml-2 stroke-[3]" />
              </button>
            )}
          </div>

        </div>

        {/* Skincare Coaching Tips Panel */}
        <div className="glass-card p-6 shadow-sm">
          <h4 className="text-xs font-bold tracking-widest uppercase text-rosevia-clay mb-3">Skin Coaching Tips</h4>
          <div className="space-y-2">
            {routine.tips.map((tip, idx) => (
              <div key={idx} className="flex items-start text-xs text-rosevia-clay/85 leading-relaxed bg-white/40 p-3 rounded-xl border border-rosevia-rose/20 shadow-xs">
                <span className="text-rosevia-gold font-bold mr-2">✦</span>
                <p className="font-medium">{tip}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* FLOATING BOTTOM PREMIUM NAVIGATION DOCK (BALANCED FOR 6 ITEMS) */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md glass-panel py-3.5 px-6 rounded-2xl flex justify-between items-center shadow-lg border border-rosevia-rose/40 z-50">
        <button 
          onClick={() => navigateTo("/")}
          className="flex flex-col items-center text-rosevia-gold shrink-0 cursor-pointer"
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
          className="flex flex-col items-center text-rosevia-clay/70 hover:text-rosevia-clay shrink-0 cursor-pointer animate-none"
        >
          <BookOpen size={18} />
          <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">Diary</span>
        </button>
      </nav>

    </div>
  );
}

function LoaderSpinner() {
  return (
    <div className="flex flex-col items-center space-y-3">
      <RefreshCw size={36} className="text-rosevia-gold animate-spin" />
      <p className="text-xs tracking-widest text-rosevia-clay uppercase">Loading Path...</p>
    </div>
  );
}
