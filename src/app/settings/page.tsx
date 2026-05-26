"use client";

import { useState, useEffect } from "react";
import { 
  Settings, 
  Layers, 
  Activity, 
  FolderHeart, 
  AlertCircle, 
  BookOpen, 
  Clock, 
  Bell, 
  MapPin, 
  Heart,
  RefreshCw,
  LogOut,
  Palette,
  CheckCircle,
  Volume2
} from "lucide-react";

interface Reminders {
  serumTimeAM: string;
  serumTimePM: string;
  moistTimeAM: string;
  moistTimePM: string;
  spfTime: string;
  spfInterval: number;
}

export default function SkincareSettings() {
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [reminders, setReminders] = useState<Reminders>({
    serumTimeAM: "08:00",
    serumTimePM: "21:30",
    moistTimeAM: "08:15",
    moistTimePM: "21:45",
    spfTime: "09:00",
    spfInterval: 2
  });

  const [toggles, setToggles] = useState({
    pushSimulation: true,
    climateAdapt: true,
    hormoneSync: false,
    ambientSound: false
  });

  const [activeThemeVariant, setActiveThemeVariant] = useState("Midnight Jade");
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const navigateTo = (path: string) => {
    window.location.href = path;
  };

  useEffect(() => {
    setMounted(true);
    
    // Load profile
    const savedProfile = localStorage.getItem("rosevia_profile");
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    } else {
      setProfile({ skinType: "Combination", concerns: ["Acne", "Redness"], age: "25-39", experience: "Intermediate" });
    }

    // Load reminders
    const savedReminders = localStorage.getItem("rosevia_reminders");
    if (savedReminders) {
      setReminders(JSON.parse(savedReminders));
    }

    // Load system toggles
    const savedToggles = localStorage.getItem("rosevia_system_toggles");
    if (savedToggles) {
      setToggles(JSON.parse(savedToggles));
    }

    // Load active theme
    const savedTheme = localStorage.getItem("rosevia_theme");
    if (savedTheme) {
      setActiveThemeVariant(savedTheme);
    }
  }, []);

  const handleThemeChange = (themeName: string) => {
    setActiveThemeVariant(themeName);
    localStorage.setItem("rosevia_theme", themeName);
  };

  const saveSettings = () => {
    localStorage.setItem("rosevia_reminders", JSON.stringify(reminders));
    localStorage.setItem("rosevia_system_toggles", JSON.stringify(toggles));
    localStorage.setItem("rosevia_theme", activeThemeVariant);
    
    setSaveStatus("SAVED SUCCESSFULLY");
    setTimeout(() => {
      setSaveStatus(null);
      // Force page reload so theme propagates instantly to body and wrappers
      window.location.reload();
    }, 1000);
  };

  const handleLogout = () => {
    localStorage.removeItem("rosevia_profile");
    localStorage.removeItem("rosevia_routine");
    localStorage.removeItem("rosevia_cabinet");
    localStorage.removeItem("rosevia_streak");
    localStorage.removeItem("rosevia_journal_log");
    localStorage.removeItem("rosevia_reminders");
    localStorage.removeItem("rosevia_system_toggles");
    localStorage.removeItem("rosevia_theme");
    navigateTo("/");
  };

  if (!mounted || !profile) {
    return (
      <div className="min-h-screen bg-rosevia-cream flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <RefreshCw size={36} className="text-rosevia-gold animate-spin" />
          <p className="text-xs tracking-widest text-rosevia-clay uppercase">Loading Configurations...</p>
        </div>
      </div>
    );
  }

  // Dynamic Theme Styling Classes
  const getThemeClasses = () => {
    switch (activeThemeVariant) {
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

  return (
    <div className={`min-h-screen ${currentTheme.bg} pb-28 select-none transition-colors duration-500`}>
      <div className="max-w-4xl mx-auto px-4 pt-6 md:pt-10 flex flex-col space-y-6 animate-fade-in">
        
        {/* Header Title */}
        <header className="flex justify-between items-start">
          <div>
            <h1 className="text-xs tracking-widest font-bold text-rosevia-clay uppercase">Skincare System Preferences</h1>
            <p className="text-2xl md:text-3xl font-serif tracking-tight font-light mt-1">
              Personalized Settings & <span className={`italic ${currentTheme.gold} font-normal`}>Reminder Alarms</span>
            </p>
          </div>
          
          {/* Clinical Profile Circle Initials return to Home */}
          <button 
            onClick={() => navigateTo("/")}
            className={`w-10 h-10 rounded-full bg-gradient-to-tr from-rosevia-gold/30 to-rosevia-rose/30 border ${currentTheme.gold === "text-rosevia-gold" ? "border-rosevia-gold/50 text-rosevia-gold" : "border-neutral-500 text-neutral-400"} flex items-center justify-center font-serif text-xs font-bold hover:shadow-lg transition-all shrink-0 cursor-pointer`}
          >
            RN
          </button>
        </header>

        {/* Welcome Back Ralein Banner */}
        <div className={`${currentTheme.card} p-4 flex items-center justify-between shadow-xs border-l-2 border-rosevia-gold`}>
          <div className="flex items-center space-x-3.5">
            <div className="relative w-10 h-10 rounded-full bg-rosevia-rose/30 flex items-center justify-center border border-rosevia-gold/30 shrink-0">
              <span className={`font-serif text-xs font-bold ${currentTheme.gold}`}>R</span>
            </div>
            <div>
              <p className="text-xs font-bold leading-none">Skincare Profile: Ralein</p>
              <p className={`text-[9px] ${currentTheme.accent} font-bold uppercase mt-1 tracking-wider`}>
                Skin Type: {profile.skinType} | Concerns: {profile.concerns.join(", ")}
              </p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="px-3.5 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-[9px] font-bold tracking-wider text-rose-300 uppercase transition-all duration-300 flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <LogOut size={10} /> Logout
          </button>
        </div>

        {/* Core Layout Split */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Alarms Scheduling Column */}
          <div className="md:col-span-7 space-y-6">
            
            {/* Alarm Reminder Cards */}
            <div className={`${currentTheme.card} p-6 space-y-5 shadow-sm`}>
              <div className="flex items-center space-x-2">
                <Clock size={16} className={currentTheme.gold} />
                <h3 className={`text-xs font-semibold tracking-widest uppercase ${currentTheme.accent}`}>Skincare Layer Reminder Alarms</h3>
              </div>
              <p className={`text-xs ${currentTheme.accent} leading-relaxed font-medium`}>
                Configure specific times to use your clinical skincare layers. Rosevia will simulate reminders at these precise times on your dashboard!
              </p>

              <div className="space-y-4 pt-2">
                {/* 1. Serum Reminder Alarms */}
                <div className="bg-rosevia-cream border border-rosevia-rose/20 rounded-xl p-4 space-y-3.5 shadow-xs">
                  <p className="text-[10px] font-bold text-rosevia-gold uppercase tracking-wider flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-rosevia-gold mr-2" /> Active Serum Reminders
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-rosevia-clay/75 font-bold uppercase">AM Serum Time</label>
                      <input 
                        type="time" 
                        value={reminders.serumTimeAM} 
                        onChange={(e) => setReminders({ ...reminders, serumTimeAM: e.target.value })}
                        className="w-full bg-rosevia-sand border border-rosevia-rose/30 rounded-lg p-2.5 text-xs text-rosevia-charcoal font-bold focus:outline-none focus:border-rosevia-gold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-rosevia-clay/75 font-bold uppercase">PM Serum/Retinol Time</label>
                      <input 
                        type="time" 
                        value={reminders.serumTimePM} 
                        onChange={(e) => setReminders({ ...reminders, serumTimePM: e.target.value })}
                        className="w-full bg-rosevia-sand border border-rosevia-rose/30 rounded-lg p-2.5 text-xs text-rosevia-charcoal font-bold focus:outline-none focus:border-rosevia-gold"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Moisturizer Reminder Alarms */}
                <div className="bg-rosevia-cream border border-rosevia-rose/20 rounded-xl p-4 space-y-3.5 shadow-xs">
                  <p className="text-[10px] font-bold text-rosevia-gold uppercase tracking-wider flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-rosevia-gold mr-2" /> Barrier Moisturizer Reminders
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-rosevia-clay/75 font-bold uppercase">AM Moisturizer Time</label>
                      <input 
                        type="time" 
                        value={reminders.moistTimeAM} 
                        onChange={(e) => setReminders({ ...reminders, moistTimeAM: e.target.value })}
                        className="w-full bg-rosevia-sand border border-rosevia-rose/30 rounded-lg p-2.5 text-xs text-rosevia-charcoal font-bold focus:outline-none focus:border-rosevia-gold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-rosevia-clay/75 font-bold uppercase">PM Moisture Seal Time</label>
                      <input 
                        type="time" 
                        value={reminders.moistTimePM} 
                        onChange={(e) => setReminders({ ...reminders, moistTimePM: e.target.value })}
                        className="w-full bg-rosevia-sand border border-rosevia-rose/30 rounded-lg p-2.5 text-xs text-rosevia-charcoal font-bold focus:outline-none focus:border-rosevia-gold"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Sunscreen SPF Reminder Alarm */}
                <div className="bg-rosevia-cream border border-rosevia-rose/20 rounded-xl p-4 space-y-3.5 shadow-xs">
                  <p className="text-[10px] font-bold text-rosevia-gold uppercase tracking-wider flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-rosevia-gold mr-2" /> Broad Spectrum SPF Protection Alarms
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-rosevia-clay/75 font-bold uppercase">Morning SPF Lock Time</label>
                      <input 
                        type="time" 
                        value={reminders.spfTime} 
                        onChange={(e) => setReminders({ ...reminders, spfTime: e.target.value })}
                        className="w-full bg-rosevia-sand border border-rosevia-rose/30 rounded-lg p-2.5 text-xs text-rosevia-charcoal font-bold focus:outline-none focus:border-rosevia-gold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-rosevia-clay/75 font-bold uppercase">SPF Reapply Interval</label>
                      <select 
                        value={reminders.spfInterval} 
                        onChange={(e) => setReminders({ ...reminders, spfInterval: parseInt(e.target.value) })}
                        className="w-full bg-rosevia-sand border border-rosevia-rose/30 rounded-lg p-2.5 text-xs text-rosevia-charcoal font-bold focus:outline-none focus:border-rosevia-gold cursor-pointer"
                      >
                        <option value="2">Every 2 Hours (Clinical Standard)</option>
                        <option value="3">Every 3 Hours (Indoor moderate)</option>
                        <option value="4">Every 4 Hours (Low UV days)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Settings Action */}
              <button
                onClick={saveSettings}
                className={`w-full py-4 rounded-xl text-rosevia-cream text-xs tracking-widest font-bold uppercase shadow hover:shadow-md transition-all duration-300 cursor-pointer flex items-center justify-center transform hover:-translate-y-0.5 ${currentTheme.button}`}
              >
                {saveStatus ? (
                  <span className="flex items-center font-bold">
                    <CheckCircle size={14} className="mr-1.5 stroke-[3]" /> {saveStatus}
                  </span>
                ) : (
                  "Apply & Save Alarm Schedules"
                )}
              </button>

            </div>
          </div>

          {/* System Toggles and Theme Column */}
          <div className="md:col-span-5 space-y-6">
            
            {/* Toggles Panel */}
            <div className={`${currentTheme.card} p-5 space-y-4 shadow-sm`}>
              <div className="flex items-center space-x-2">
                <Bell size={16} className={currentTheme.gold} />
                <h3 className={`text-xs font-semibold tracking-widest uppercase ${currentTheme.accent}`}>Skincare Sync Engines</h3>
              </div>

              <div className="space-y-4 pt-1">
                {[
                  { id: "pushSimulation", label: "Simulate Push Notifications", desc: "Show elegant dynamic alerts on home screen when alarms are triggered.", icon: Bell },
                  { id: "climateAdapt", label: "Smart Climate Intelligence", desc: "Auto-adapt sunscreen and hydration advices dynamically to simulated weather.", icon: MapPin },
                  { id: "hormoneSync", label: "Hormonal Cycle Syncing", desc: "Integrate follicle oil curves and luteal barrier safeguards into schedules.", icon: Heart },
                  { id: "ambientSound", label: "Soothing Vanity Ambient Sound", desc: "Play premium white-noise river sound during diagnostics scans.", icon: Volume2 }
                ].map((item) => (
                  <div key={item.id} className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="text-xs font-bold flex items-center"><item.icon size={12} className="mr-1.5" /> {item.label}</p>
                      <p className={`text-[10px] ${currentTheme.accent} mt-0.5 leading-relaxed font-semibold`}>{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                      <input 
                        type="checkbox" 
                        checked={(toggles as any)[item.id]} 
                        onChange={(e) => setToggles({ ...toggles, [item.id]: e.target.checked })}
                        className="sr-only peer" 
                      />
                      <div className="w-8 h-4.5 bg-rosevia-rose/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-rosevia-gold"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Unique Theme customizer */}
            <div className={`${currentTheme.card} p-5 space-y-4 shadow-sm`}>
              <div className="flex items-center space-x-2">
                <Palette size={16} className={currentTheme.gold} />
                <h3 className={`text-xs font-semibold tracking-widest uppercase ${currentTheme.accent}`}>Premium Theme Variant</h3>
              </div>
              <p className={`text-[10px] ${currentTheme.accent} leading-relaxed font-medium`}>
                Choose a unique aesthetic variation for your dark clinical apothecary vanity:
              </p>

              <div className="grid grid-cols-1 gap-2 pt-1">
                {[
                  { name: "Midnight Jade", desc: "Deep malachite emerald stone with liquid gold borders" },
                  { name: "Polished Obsidian", desc: "Sleek obsidian off-black glass with golden highlights" },
                  { name: "Liquid Gold Premium", desc: "Extra metallic golden glows and luxury borders" }
                ].map((theme) => (
                  <button
                    key={theme.name}
                    onClick={() => handleThemeChange(theme.name)}
                    className={`text-left p-3 rounded-xl border text-xs transition-all duration-300 cursor-pointer ${
                      activeThemeVariant === theme.name 
                        ? "bg-rosevia-rose/25 border-rosevia-gold shadow-sm font-bold"
                        : "bg-rosevia-cream/80 border-rosevia-rose/20 hover:border-rosevia-rose/50"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold">{theme.name}</span>
                      <span className={`text-[9px] uppercase tracking-wider ${currentTheme.gold} font-bold`}>Selected</span>
                    </div>
                    <p className={`text-[9px] ${currentTheme.accent} mt-0.5 leading-relaxed font-semibold`}>{theme.desc}</p>
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* FLOATING BOTTOM PREMIUM NAVIGATION DOCK (BALANCED FOR 6 ITEMS WITH SETTINGS) */}
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
          className="flex flex-col items-center text-rosevia-clay hover:text-rosevia-gold shrink-0 cursor-pointer"
        >
          <BookOpen size={18} />
          <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">Diary</span>
        </button>
        <button 
          onClick={() => navigateTo("/settings")}
          className="flex flex-col items-center text-rosevia-gold shrink-0 cursor-pointer animate-none"
        >
          <Settings size={18} />
          <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">Settings</span>
        </button>
      </nav>
    </div>
  );
}
