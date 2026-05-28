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
  MapPin,
  Heart,
  BookOpen,
  FolderHeart,
  Check,
  Zap,
  Settings,
  Bell,
  LogOut,
  Calendar,
  Play,
  Pause,
  RotateCcw
} from "lucide-react";
import confetti from "canvas-confetti";
import dynamic from "next/dynamic";
import Interactive3DCard from "@/components/Interactive3DCard";
import { useRouter } from "next/navigation";
import { fetchDbState, postDbAction } from "@/lib/dbSync";

const ThreeSkinSphere = dynamic(() => import("@/components/ThreeSkinSphere"), {
  ssr: false,
});

function LoaderSpinner() {
  return (
    <div className="flex flex-col items-center space-y-3">
      <RefreshCw size={36} className="text-rosevia-gold animate-spin" />
      <p className="text-xs tracking-widest text-rosevia-clay uppercase">Loading Path...</p>
    </div>
  );
}

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

interface Reminders {
  serumTimeAM: string;
  serumTimePM: string;
  moistTimeAM: string;
  moistTimePM: string;
  spfTime: string;
  spfInterval: number;
}

interface WeatherAdvice {
  title: string;
  desc: string;
  uv: string;
  humidity: string;
  temp: string;
  adjust: string;
  city: string;
}

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [activeDay, setActiveDay] = useState<string>("monday");
  const [streak, setStreak] = useState<number>(3);
  const [completedAM, setCompletedAM] = useState<boolean>(false);
  const [completedPM, setCompletedPM] = useState<boolean>(false);
  
  // Theme state
  const [theme, setTheme] = useState<string>("Midnight Jade");

  // Profile dropdown state
  const [showProfileDropdown, setShowProfileDropdown] = useState<boolean>(false);

  // Reminders state
  const [reminders, setReminders] = useState<Reminders>({
    serumTimeAM: "08:00",
    serumTimePM: "21:30",
    moistTimeAM: "08:15",
    moistTimePM: "21:45",
    spfTime: "09:00",
    spfInterval: 2
  });
  
  // Geolocation & Weather advice state
  const [weatherAdvice, setWeatherAdvice] = useState<WeatherAdvice>({
    title: "Atmospheric Shield Calibrating",
    desc: "Fetching your real-time local UV and humidity parameters...",
    uv: "Moderate (3)",
    humidity: "50%",
    temp: "15°C",
    adjust: "Adaptive Shield",
    city: "Local Location"
  });
  const [loadingWeather, setLoadingWeather] = useState<boolean>(false);
  const [climateSim, setClimateSim] = useState<string>("local"); 
  
  // Tablets & Supplements state
  const [tablets, setTablets] = useState<any[]>([]);

  // Wait timer widget states
  const [waitTimer, setWaitTimer] = useState<number>(0);
  const [timerMax, setTimerMax] = useState<number>(0);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);

  // Hormonal cycle sync state
  const [cycleSync, setCycleSync] = useState<boolean>(false);
  const [cyclePhase, setCyclePhase] = useState<string>("Follicular (Glow)");

  const navigateTo = (path: string) => {
    router.push(path);
  };

  // Wait timer interval ticker
  useEffect(() => {
    let timerInterval: any;
    if (isTimerActive && waitTimer > 0) {
      timerInterval = setInterval(() => {
        setWaitTimer((prev) => prev - 1);
      }, 1000);
    } else if (waitTimer === 0 && isTimerActive) {
      setIsTimerActive(false);
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        new Notification("Skincare Wait Time Finished!", { 
          body: "Your active layer has fully absorbed. You can apply the next step." 
        });
      }
    }
    return () => clearInterval(timerInterval);
  }, [isTimerActive, waitTimer]);

  const startWaitTimer = (minutes: number) => {
    setWaitTimer(minutes * 60);
    setTimerMax(minutes * 60);
    setIsTimerActive(true);
    if (typeof window !== "undefined" && "Notification" in window) {
      Notification.requestPermission();
    }
  };

  const stopWaitTimer = () => {
    setIsTimerActive(false);
  };

  const resetWaitTimer = () => {
    setIsTimerActive(false);
    setWaitTimer(0);
    setTimerMax(0);
  };

  const logTakePill = async (id: string, name: string) => {
    const res = await postDbAction("take_pill", { id });
    if (res && res.success) {
      confetti({
        particleCount: 80,
        spread: 50,
        colors: ["#D4AF37", "#FAF7F2", "#688A7D"]
      });
      // Update local storage and cabinet state
      const savedCabinet = localStorage.getItem("rosevia_cabinet");
      if (savedCabinet) {
        const cabinetItems = JSON.parse(savedCabinet);
        const updated = cabinetItems.map((p: any) => {
          if (p.id === id) {
            return { ...p, remainingTablets: res.remaining };
          }
          return p;
        });
        localStorage.setItem("rosevia_cabinet", JSON.stringify(updated));
        setTablets(updated.filter((p: any) => p.category.toLowerCase() === "tablet"));
      }
    } else {
      alert(`Could not log tablet dosage for "${name}". Check if you have tablets remaining!`);
    }
  };

  const fetchRealTimeWeather = async (activeProfile: Profile) => {
    setLoadingWeather(true);
    
    // Default fallback coordinates (Coimbatore)
    const fallbackCoords = { lat: 11.0168, lng: 76.9558, name: "Coimbatore" };

    const fetchWeatherForCoords = async (latitude: number, longitude: number, cityName: string) => {
      try {
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m&daily=uv_index_max&timezone=auto`;
        const weatherRes = await fetch(weatherUrl);
        const weatherData = await weatherRes.json();
        
        const currentTemp = Math.round(weatherData.current.temperature_2m);
        const currentHumidity = Math.round(weatherData.current.relative_humidity_2m);
        const currentUV = weatherData.daily.uv_index_max && weatherData.daily.uv_index_max[0] !== undefined 
          ? Math.round(weatherData.daily.uv_index_max[0]) 
          : 1;

        // Fetch AI recommendation
        const aiResponse = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "weatherAdvice",
            temp: currentTemp,
            humidity: currentHumidity,
            uv: currentUV,
            city: cityName,
            skinType: activeProfile.skinType,
            concerns: activeProfile.concerns
          })
        });
        
        const aiData = await aiResponse.json();
        if (aiData.advice) {
          setWeatherAdvice({
            title: aiData.advice.title,
            desc: aiData.advice.desc,
            uv: currentUV >= 8 ? `Extreme (${currentUV})` : currentUV >= 5 ? `High (${currentUV})` : currentUV >= 3 ? `Moderate (${currentUV})` : `Low (${currentUV})`,
            humidity: `${currentHumidity}%`,
            temp: `${currentTemp}°C`,
            adjust: aiData.advice.adjust,
            city: cityName
          });
        }
      } catch (err) {
        console.error("Failed to load local weather details:", err);
      } finally {
        setLoadingWeather(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          let cityName = "Local Position";
          try {
            const geocodeUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
            const geocodeRes = await fetch(geocodeUrl);
            const geocodeData = await geocodeRes.json();
            cityName = geocodeData.city || geocodeData.locality || geocodeData.principalSubdivision || "Local Position";
          } catch (err) {
            console.error("Reverse geocoding error:", err);
          }
          await fetchWeatherForCoords(latitude, longitude, cityName);
        },
        async (error) => {
          console.warn("Geolocation denied/failed. Falling back to default:", error);
          await fetchWeatherForCoords(fallbackCoords.lat, fallbackCoords.lng, fallbackCoords.name);
        }
      );
    } else {
      await fetchWeatherForCoords(fallbackCoords.lat, fallbackCoords.lng, fallbackCoords.name);
    }
  };

  useEffect(() => {
    setMounted(true);
    
    // Load local and database states
    const syncData = async () => {
      const dbState = await fetchDbState();
      let activeProfile: Profile | null = null;
      let activeRoutine: Routine | null = null;

      if (dbState) {
        if (dbState.profile) {
          activeProfile = dbState.profile;
          setProfile(activeProfile);
          localStorage.setItem("rosevia_profile", JSON.stringify(activeProfile));
        }
        if (dbState.routine) {
          activeRoutine = dbState.routine;
          setRoutine(activeRoutine);
          localStorage.setItem("rosevia_routine", JSON.stringify(activeRoutine));
        }
        if (dbState.cabinet) {
          localStorage.setItem("rosevia_cabinet", JSON.stringify(dbState.cabinet));
          const tabletItems = dbState.cabinet.filter((p: any) => p.category.toLowerCase() === "tablet");
          setTablets(tabletItems);
        }
      }

      // If DB is blank, fall back to localStorage migration
      if (!activeProfile) {
        const savedProfile = localStorage.getItem("rosevia_profile");
        if (savedProfile) {
          activeProfile = JSON.parse(savedProfile);
          setProfile(activeProfile);
          postDbAction("save_profile", { profile: activeProfile });
        }
      }
      if (!activeRoutine) {
        const savedRoutine = localStorage.getItem("rosevia_routine");
        if (savedRoutine) {
          activeRoutine = JSON.parse(savedRoutine);
          setRoutine(activeRoutine);
          postDbAction("save_routine", { routine: activeRoutine });
        }
      }

      const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
      const currentDay = days[new Date().getDay()];
      setActiveDay(currentDay);

      const savedStreak = localStorage.getItem("rosevia_streak");
      if (savedStreak) {
        setStreak(parseInt(savedStreak));
      }

      const savedReminders = localStorage.getItem("rosevia_reminders");
      if (savedReminders) {
        setReminders(JSON.parse(savedReminders));
      }

      const savedToggles = localStorage.getItem("rosevia_system_toggles");
      if (savedToggles) {
        const parsed = JSON.parse(savedToggles);
        setCycleSync(parsed.hormoneSync || false);
        setClimateSim("local");
      }

      const savedTheme = localStorage.getItem("rosevia_theme");
      if (savedTheme) {
        setTheme(savedTheme);
      }

      if (activeProfile) {
        fetchRealTimeWeather(activeProfile);
      }
    };

    syncData();
  }, []);

  const handleDeleteProfile = async () => {
    await postDbAction("delete_profile", {});
    localStorage.removeItem("rosevia_profile");
    localStorage.removeItem("rosevia_routine");
    localStorage.removeItem("rosevia_cabinet");
    localStorage.removeItem("rosevia_streak");
    localStorage.removeItem("rosevia_journal_log");
    localStorage.removeItem("rosevia_reminders");
    localStorage.removeItem("rosevia_system_toggles");
    localStorage.removeItem("rosevia_theme");
    setStreak(0);
    setProfile(null);
    setRoutine(null);
    setTablets([]);
    window.location.reload();
  };


  if (!mounted) {
    return (
      <div className="min-h-screen bg-rosevia-cream flex items-center justify-center">
        <LoaderSpinner />
      </div>
    );
  }

  // Dynamic Theme Styling Classes
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

  // 1. GORGEOUS LANDING SPLASH IF NOT ONBOARDED (DARK APOTHECARY AESTHETIC)
  if (!profile || !routine) {
    return (
      <div className="min-h-screen bg-[#060D0B] text-rosevia-charcoal flex flex-col justify-between p-6 md:p-12 relative overflow-hidden select-none">
        {/* Three.js Organic Background Canvas */}
        <ThreeSkinSphere />

        {/* Soft background malachite/obsidian/gold glows */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-rosevia-rose/5 blur-[120px] pointer-events-none z-0" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-rosevia-gold/3 blur-[100px] pointer-events-none z-0" />

        {/* Premium Navbar */}
        <header className="flex justify-between items-center z-10 max-w-5xl mx-auto w-full relative">
          <div className="flex items-center space-x-2">
            <span className="font-serif text-3xl tracking-widest text-rosevia-gold uppercase font-semibold">Rosevia</span>
          </div>
          <span className="text-[9px] tracking-widest text-rosevia-rose font-bold uppercase bg-rosevia-green border border-rosevia-rose/25 px-3 py-1 rounded-full">Skin Wellness AI</span>
        </header>

        {/* Main hero area */}
        <main className="max-w-4xl mx-auto my-auto flex flex-col items-center text-center z-10 space-y-8 pt-12 relative">
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full border border-rosevia-gold/30 bg-rosevia-sand/70 text-rosevia-clay text-[10px] tracking-widest uppercase font-bold shadow-sm backdrop-blur-md">
              <Sparkles size={12} className="text-rosevia-gold animate-pulse mr-1" />
              <span>Great skin is consistent, not complicated</span>
            </div>
            <h1 className="text-4xl md:text-7xl font-serif text-rosevia-charcoal tracking-tight leading-tight select-none">
              The premium path to <br />
              <span className="italic text-rosevia-gold font-light">radiant, timeless</span> skin.
            </h1>
            <p className="text-xs md:text-sm text-rosevia-clay max-w-xl mx-auto leading-relaxed font-semibold drop-shadow-md">
              We analyze your facial biology, cross-reference ingredient conflicts, adjust for climate UV, and build your bespoke clinical routines. You show up. Rosevia figures out the rest.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-4 items-center justify-center w-full">
            <Interactive3DCard maxTilt={10} scale={1.05} className="rounded-full shadow-lg">
              <button
                onClick={() => navigateTo("/quiz")}
                className="px-10 py-5 rounded-full text-xs font-bold tracking-widest uppercase bg-rosevia-gold text-rosevia-cream hover:bg-rosevia-rose transition-all duration-300 flex items-center justify-center cursor-pointer shadow-lg"
              >
                Consult Our AI & Build Cycle <ChevronRight size={14} className="ml-2" />
              </button>
            </Interactive3DCard>
          </div>

          {/* Premium Value Props Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full pt-16">
            {[
              { title: "Intelligent Layouts", desc: "Strict application order & wait-times" },
              { title: "Conflict Scanning", desc: "Avoid active acid cell stress" },
              { title: "AI Selfie Analysis", desc: "Track weekly clinical skin index" },
              { title: "Vanity Reminders", desc: "Sunscreen, Serum, & Moisturizer alarms" }
            ].map((prop, idx) => (
              <Interactive3DCard key={idx} className="rounded-2xl shadow-sm" maxTilt={14}>
                <div className="bg-rosevia-sand/65 border border-rosevia-rose/15 rounded-2xl p-5 text-center glass-card shadow-sm h-full flex flex-col justify-center select-none">
                  <p className="text-[10px] font-bold text-rosevia-gold tracking-wider uppercase">{prop.title}</p>
                  <p className="text-[9px] text-rosevia-clay mt-1.5 leading-relaxed font-semibold">{prop.desc}</p>
                </div>
              </Interactive3DCard>
            ))}
          </div>
        </main>

        <footer className="text-center text-[9px] tracking-widest text-rosevia-clay/60 z-10 mt-12 font-semibold relative">
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
      colors: ["#FAF7F2", "#688A7D", "#D4AF37", "#111C18"]
    });

    const newStreak = streak + 1;
    setStreak(newStreak);
    localStorage.setItem("rosevia_streak", newStreak.toString());
  };


  return (
    <div className={`min-h-screen ${currentTheme.bg} pb-28 select-none transition-colors duration-500`}>
      
      {/* Header Profile Panel */}
      <div className="max-w-4xl mx-auto px-4 pt-6 md:pt-10 flex flex-col space-y-6">
        <header className="flex justify-between items-start relative">
          <div>
            <h1 className="text-xs tracking-widest font-bold text-rosevia-clay uppercase">Welcome to Your Path</h1>
            <p className="text-2xl md:text-3xl font-serif tracking-tight font-light mt-1">
              Welcome back, <span className={`italic ${currentTheme.gold} font-normal`}>Ralein.</span>
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            {/* Streak Badge with premium warm gold glow */}
            <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-rosevia-rose/20 border border-rosevia-rose/30 shadow-sm hover:shadow transition-all duration-300">
              <Flame size={14} className={`${currentTheme.gold} fill-rosevia-gold animate-bounce mr-0.5`} />
              <span className="text-[10px] font-bold text-rosevia-clay">{streak} Day Streak</span>
            </div>

            {/* Clickable Profile Circle Badge */}
            <div className="relative">
              <button 
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className={`w-10 h-10 rounded-full bg-gradient-to-tr from-rosevia-gold/30 to-rosevia-rose/30 border ${currentTheme.gold === "text-rosevia-gold" ? "border-rosevia-gold/50 text-rosevia-gold" : "border-neutral-500 text-neutral-400"} flex items-center justify-center font-serif text-xs font-bold hover:shadow-lg transition-all cursor-pointer`}
              >
                RN
              </button>

              {/* Glassmorphic Dropdown Overlay */}
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-64 glass-panel rounded-2xl p-4 shadow-xl z-50 animate-fade-in space-y-4">
                  <div className="border-b border-rosevia-rose/20 pb-3">
                    <p className="text-xs font-bold leading-none">Ralein's Skincare Profile</p>
                    <span className={`text-[8px] ${currentTheme.gold} uppercase tracking-wider font-bold block mt-1`}>Clinical Skin Metrics</span>
                  </div>
                  
                  <div className={`space-y-2 text-[10px] font-medium ${currentTheme.accent}`}>
                    <div className="flex justify-between">
                      <span className="font-semibold text-rosevia-clay/60">SKIN TYPE</span>
                      <span className="font-bold">{profile.skinType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-rosevia-clay/60">MAIN CONCERN</span>
                      <span className="font-bold">{profile.concerns[0]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-rosevia-clay/60">EXPERIENCE</span>
                      <span className="font-bold">{profile.experience}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-rosevia-clay/60">AGE GROUP</span>
                      <span className="font-bold">{profile.age}</span>
                    </div>
                  </div>

                  <div className="border-t border-rosevia-rose/20 pt-3">
                    <button 
                      onClick={handleDeleteProfile}
                      className="w-full py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-[9px] font-bold tracking-wider text-rose-300 uppercase transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <LogOut size={11} /> Delete Profile
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Current Active Cycle Info Card */}
        <div className={`${currentTheme.card} p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm relative overflow-hidden`}>
          <div className="absolute top-[-10%] right-[-5%] w-[30%] h-[120%] bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none transform rotate-12" />
          <div className="space-y-1">
            <span className="text-[9px] tracking-widest font-bold uppercase text-rosevia-gold px-2.5 py-1 bg-rosevia-green border border-rosevia-rose/30 rounded-md shadow-xs">
              Active Cycle
            </span>
            <h2 className={`text-xl font-serif ${currentTheme.accent} mt-2.5 font-bold`}>
              {routine.routineName}
            </h2>
            <p className={`text-xs ${currentTheme.accent} mt-1 leading-relaxed max-w-xl font-medium`}>
              Focus: {routine.focus}
            </p>
          </div>
          <div className="flex items-center space-x-4 border-t md:border-t-0 md:border-l border-rosevia-rose/20 pt-3 md:pt-0 md:pl-6 shrink-0 w-full md:w-auto">
            <div className="text-center">
              <p className="text-[9px] tracking-widest uppercase font-bold text-rosevia-clay/55">Skin Type</p>
              <p className={`text-xs font-bold ${currentTheme.gold} mt-0.5`}>{profile.skinType}</p>
            </div>
            <div className="h-6 w-px bg-rosevia-rose/25" />
            <div className="text-center">
              <p className="text-[9px] tracking-widest uppercase font-bold text-rosevia-clay/55">Goal</p>
              <p className={`text-xs font-bold ${currentTheme.gold} mt-0.5`}>{profile.concerns[0]}</p>
            </div>
          </div>
        </div>

        {/* Dynamic Scheduled Reminder Alarms Widget */}
        <div className={`${currentTheme.card} p-5 space-y-4 shadow-sm relative overflow-hidden`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock size={16} className={`${currentTheme.gold} animate-pulse`} />
              <h3 className={`text-xs font-semibold tracking-widest uppercase ${currentTheme.accent}`}>Skincare Layer Alarms</h3>
            </div>
            <button 
              onClick={() => navigateTo("/settings")}
              className={`text-[9px] font-bold ${currentTheme.gold} tracking-wider uppercase hover:underline flex items-center`}
            >
              Configure Alarms <Settings size={10} className="ml-1" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-rosevia-cream/80 border border-rosevia-rose/20 rounded-xl p-3.5 flex items-center space-x-3.5 shadow-xs">
              <div className="w-8 h-8 rounded-full bg-rosevia-rose/25 flex items-center justify-center shrink-0">
                <Bell size={14} className="text-rosevia-gold" />
              </div>
              <div>
                <p className="text-[9px] tracking-wider uppercase font-bold text-rosevia-clay/65 leading-none">Serum Reminder</p>
                <p className="text-xs font-bold text-rosevia-charcoal mt-1">AM {reminders.serumTimeAM} | PM {reminders.serumTimePM}</p>
              </div>
            </div>
            <div className="bg-rosevia-cream/80 border border-rosevia-rose/20 rounded-xl p-3.5 flex items-center space-x-3.5 shadow-xs">
              <div className="w-8 h-8 rounded-full bg-rosevia-rose/25 flex items-center justify-center shrink-0">
                <Bell size={14} className="text-rosevia-gold" />
              </div>
              <div>
                <p className="text-[9px] tracking-wider uppercase font-bold text-rosevia-clay/65 leading-none">Moisturizer Alarm</p>
                <p className="text-xs font-bold text-rosevia-charcoal mt-1">AM {reminders.moistTimeAM} | PM {reminders.moistTimePM}</p>
              </div>
            </div>
            <div className="bg-rosevia-cream/80 border border-rosevia-rose/20 rounded-xl p-3.5 flex items-center space-x-3.5 shadow-xs">
              <div className="w-8 h-8 rounded-full bg-rosevia-rose/25 flex items-center justify-center shrink-0">
                <Sun size={14} className="text-rosevia-gold" />
              </div>
              <div>
                <p className="text-[9px] tracking-wider uppercase font-bold text-rosevia-clay/65 leading-none">Sunscreen Alarm</p>
                <p className="text-xs font-bold text-rosevia-charcoal mt-1">{reminders.spfTime} (Every {reminders.spfInterval}h)</p>
              </div>
            </div>
          </div>

          {/* Simulated Active Push-Alert Banner */}
          <div className="bg-rosevia-green border-l-2 border-rosevia-gold p-3 rounded-xl flex items-center justify-between text-[11px] font-medium text-rosevia-clay animate-pulse">
            <span className="flex items-center gap-2">
              <Bell size={12} className="text-rosevia-gold animate-bounce shrink-0" />
              <span>Reminder Active: Sunscreen (SPF) reapplication alert scheduled in <b>1 hour 45 minutes</b></span>
            </span>
            <span className="text-[9px] uppercase tracking-widest font-bold text-rosevia-gold shrink-0">Simulated Alert</span>
          </div>
        </div>

        {/* Environmental & Hormonal Intelligence Hub */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* 1. Climate Simulator Widget with Dynamic Ambient Styling */}
          <div className={`border p-6 rounded-2xl transition-all duration-500 bg-gradient-to-br ${
            weatherAdvice.uv.includes("High") || weatherAdvice.uv.includes("Extreme")
              ? "from-amber-950/40 via-orange-950/20 to-[#060D0B] border-amber-900/30"
              : parseInt(weatherAdvice.humidity) < 40 || parseInt(weatherAdvice.temp) < 10
              ? "from-blue-950/40 via-indigo-950/20 to-[#060D0B] border-blue-900/30"
              : parseInt(weatherAdvice.humidity) > 75 && parseInt(weatherAdvice.temp) > 25
              ? "from-teal-950/40 via-emerald-950/20 to-[#060D0B] border-emerald-900/30"
              : "from-purple-950/40 via-slate-950/20 to-[#060D0B] border-purple-900/30"
          } shadow-sm space-y-4`}>
            <div className="flex justify-between items-center gap-3 w-full">
              <div className="flex items-center space-x-2">
                <MapPin size={16} className="text-rosevia-clay" />
                <h3 className="text-xs font-bold tracking-widest uppercase text-rosevia-clay">Climate Intelligence</h3>
              </div>
              <button
                onClick={() => {
                  if (profile) fetchRealTimeWeather(profile);
                }}
                disabled={loadingWeather}
                className="text-[9px] font-bold px-3 py-1.5 rounded-lg bg-rosevia-cream/80 hover:bg-rosevia-gold hover:text-rosevia-cream border border-rosevia-rose/30 text-rosevia-clay disabled:opacity-50 transition-all duration-300 cursor-pointer flex items-center gap-1 shadow-xs font-semibold uppercase tracking-wider shrink-0"
              >
                {loadingWeather ? <RefreshCw size={10} className="animate-spin" /> : <RefreshCw size={10} />} Refresh
              </button>
            </div>

            {/* Weather Metrics */}
            <div className="grid grid-cols-3 gap-2 bg-rosevia-cream/80 border border-rosevia-rose/20 rounded-xl p-3 text-center shadow-xs">
              <div>
                <p className="text-[9px] tracking-wider uppercase font-bold text-rosevia-clay/60">UV Index</p>
                <p className="text-xs font-bold text-rosevia-gold mt-0.5">{weatherAdvice.uv}</p>
              </div>
              <div>
                <p className="text-[9px] tracking-wider uppercase font-bold text-rosevia-clay/60">Humidity</p>
                <p className="text-xs font-bold text-rosevia-gold mt-0.5">{weatherAdvice.humidity}</p>
              </div>
              <div>
                <p className="text-[9px] tracking-wider uppercase font-bold text-rosevia-clay/60">Recommendation</p>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                  weatherAdvice.uv.includes("High") || weatherAdvice.uv.includes("Extreme")
                    ? "text-amber-300 bg-amber-950/60 border border-amber-800/40"
                    : parseInt(weatherAdvice.humidity) < 40 || parseInt(weatherAdvice.temp) < 10
                    ? "text-blue-300 bg-blue-950/60 border border-blue-800/40"
                    : parseInt(weatherAdvice.humidity) > 75 && parseInt(weatherAdvice.temp) > 25
                    ? "text-emerald-300 bg-emerald-950/60 border border-emerald-800/40"
                    : "text-purple-300 bg-purple-950/60 border border-purple-800/40"
                }`}>
                  {weatherAdvice.adjust}
                </span>
              </div>
            </div>

            {/* Smart Environmental Adaptive Tip */}
            <div className="bg-rosevia-cream border-l-2 border-rosevia-gold p-3.5 rounded-r-xl shadow-xs">
              <p className="text-[10px] font-bold text-rosevia-clay flex items-center">
                <AlertCircle size={12} className="mr-1.5 text-rosevia-gold shrink-0" /> {weatherAdvice.title} ({weatherAdvice.city})
              </p>
              <p className="text-[11px] text-rosevia-clay/85 mt-1 leading-relaxed font-medium">
                {weatherAdvice.desc}
              </p>
            </div>
          </div>

          {/* 2. Hormonal Cycle Sync Widget with Elegant Biological Dial */}
          <div className={`${currentTheme.card} p-6 flex flex-col justify-between space-y-4 shadow-sm`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Heart size={16} className="text-rosevia-clay" />
                <h3 className={`text-xs font-bold tracking-widest uppercase ${currentTheme.accent}`}>Hormonal Sync</h3>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={cycleSync} 
                  onChange={(e) => setCycleSync(e.target.checked)} 
                  className="sr-only peer" 
                />
                <div className="w-9 h-5 bg-rosevia-rose/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rosevia-gold"></div>
                <span className="ml-2.5 text-[9px] font-bold text-rosevia-clay/80 uppercase">
                  {cycleSync ? "Sync Active" : "Sync Off"}
                </span>
              </label>
            </div>

            {cycleSync ? (
              <div className="space-y-3.5 animate-fade-in flex-1 flex flex-col justify-center">
                {/* SVG Biological Cycle Progress Dial */}
                <div className="flex items-center justify-between bg-rosevia-cream border border-rosevia-rose/25 rounded-xl p-3.5 shadow-xs">
                  <div className="flex items-center space-x-3">
                    <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
                      <svg className="absolute w-full h-full transform -rotate-90">
                        <circle cx="18" cy="18" r="14" stroke="#688A7D" strokeWidth="2.5" fill="transparent" opacity="0.3" />
                        <circle 
                          cx="18" 
                          cy="18" 
                          r="14" 
                          stroke="#D4AF37" 
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
                        className="text-xs font-bold text-rosevia-gold bg-transparent border-0 focus:ring-0 focus:outline-none p-0 cursor-pointer"
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
              <div className="flex-1 flex flex-col items-center justify-center text-center p-5 border border-dashed border-rosevia-rose/30 rounded-2xl bg-rosevia-cream/30">
                <HelpCircle size={24} className="text-rosevia-rose/85 mb-2 animate-bounce" />
                <p className="text-xs font-bold text-rosevia-clay/80 uppercase tracking-wider">Integrate Hormonal Syncing</p>
                <p className="text-[9px] text-rosevia-clay mt-1 max-w-[200px] leading-relaxed font-semibold">
                  Adapt routines to biological hormone cycles to buffer micro-breakouts before they occur. Go to Settings to toggle sync.
                </p>
              </div>
            )}
            </div>
        </div>

        {/* Dynamic Skincare Timer & Supplement Tracker */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          {/* 1. Wait Timer Widget */}
          <div className={`${currentTheme.card} p-5 space-y-4 shadow-sm relative overflow-hidden flex flex-col justify-between`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock size={16} className={currentTheme.gold} />
                <h3 className={`text-xs font-semibold tracking-widest uppercase ${currentTheme.accent}`}>Layer Penetration Timer</h3>
              </div>
              {waitTimer > 0 && (
                <span className={`text-[9px] font-bold ${currentTheme.gold} tracking-wider uppercase bg-rosevia-green border border-rosevia-rose/30 px-2 py-0.5 rounded-full`}>
                  Absorbing
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 py-2">
              <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                <svg className="absolute w-full h-full transform -rotate-90">
                  <circle cx="32" cy="32" r="26" stroke={theme === "Rose Quartz Luxury" ? "#251117" : "#111C18"} strokeWidth="3.5" fill="transparent" />
                  <circle 
                    cx="32" 
                    cy="32" 
                    r="26" 
                    stroke={theme === "Rose Quartz Luxury" ? "#E07A9A" : "#D4AF37"} 
                    strokeWidth="3.5" 
                    fill="transparent" 
                    strokeDasharray={163}
                    strokeDashoffset={timerMax > 0 ? 163 - (163 * waitTimer) / timerMax : 163} 
                    strokeLinecap="round"
                    className="transition-all duration-1000 linear"
                  />
                </svg>
                <span className="text-xs font-bold text-rosevia-charcoal z-10">
                  {waitTimer > 0 ? `${Math.floor(waitTimer / 60)}:${String(waitTimer % 60).padStart(2, "0")}` : "0:00"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-[10px] ${currentTheme.accent} leading-relaxed font-semibold`}>
                  {waitTimer > 0 
                    ? "Wait for your active acid/serum layer to fully penetrate before layering the next product." 
                    : "Start a clinical wait timer to ensure correct active ingredient absorption rates."}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {waitTimer > 0 ? (
                    <>
                      <button 
                        onClick={isTimerActive ? stopWaitTimer : () => setIsTimerActive(true)}
                        className="px-2.5 py-1 rounded bg-rosevia-green border border-rosevia-sage/35 text-[9px] font-bold tracking-wider uppercase text-rosevia-sage hover:bg-rosevia-sage hover:text-rosevia-cream cursor-pointer transition-all shadow-xs"
                      >
                        {isTimerActive ? <Pause size={10} className="inline mr-1" /> : <Play size={10} className="inline mr-1" />}
                        {isTimerActive ? "Pause" : "Resume"}
                      </button>
                      <button 
                        onClick={resetWaitTimer}
                        className="px-2.5 py-1 rounded bg-rose-950/40 border border-rose-800/40 text-[9px] font-bold tracking-wider uppercase text-rose-300 hover:bg-rose-900/60 cursor-pointer transition-all shadow-xs"
                      >
                        <RotateCcw size={10} className="inline mr-1" /> Reset
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => startWaitTimer(2)}
                        className="px-2.5 py-1 rounded bg-rosevia-gold/15 border border-rosevia-gold/30 text-[9px] font-bold tracking-wider uppercase text-rosevia-gold hover:bg-rosevia-gold hover:text-rosevia-cream cursor-pointer transition-all shadow-xs"
                      >
                        2 Mins
                      </button>
                      <button 
                        onClick={() => startWaitTimer(5)}
                        className="px-2.5 py-1 rounded bg-rosevia-gold/15 border border-rosevia-gold/30 text-[9px] font-bold tracking-wider uppercase text-rosevia-gold hover:bg-rosevia-gold hover:text-rosevia-cream cursor-pointer transition-all shadow-xs"
                      >
                        5 Mins
                      </button>
                      <button 
                        onClick={() => startWaitTimer(10)}
                        className="px-2.5 py-1 rounded bg-rosevia-gold/15 border border-rosevia-gold/30 text-[9px] font-bold tracking-wider uppercase text-rosevia-gold hover:bg-rosevia-gold hover:text-rosevia-cream cursor-pointer transition-all shadow-xs"
                      >
                        10 Mins
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 2. Tablet Dosage Tracker Widget */}
          <div className={`${currentTheme.card} p-5 space-y-4 shadow-sm relative overflow-hidden flex flex-col justify-between`}>
            <div className="flex items-center space-x-2">
              <Sparkles size={16} className={currentTheme.gold} />
              <h3 className={`text-xs font-semibold tracking-widest uppercase ${currentTheme.accent}`}>Supplement Tracker</h3>
            </div>
            {tablets.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-3 border border-dashed border-rosevia-rose/30 rounded-xl bg-rosevia-cream/30">
                <p className={`text-[10px] ${currentTheme.accent} opacity-60 italic font-semibold`}>
                  No tablets cataloged in your cabinet.
                </p>
                <button 
                  onClick={() => navigateTo("/cabinet")}
                  className={`text-[9px] font-bold ${currentTheme.gold} hover:underline mt-1.5 block cursor-pointer`}
                >
                  Add supplement tablets →
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-24 overflow-y-auto pr-1">
                {tablets.map((item) => (
                  <div 
                    key={item.id} 
                    className="bg-rosevia-cream/85 border border-rosevia-rose/25 rounded-xl p-2.5 flex items-center justify-between shadow-xs"
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      <div className="w-5 h-7 bg-rosevia-sand border border-rosevia-gold/30 rounded flex flex-col items-center justify-center gap-0.5 shrink-0">
                        <div className="w-3.5 h-1.5 bg-rosevia-gold/80 rounded-full" />
                        <div className="w-3.5 h-1.5 bg-rosevia-clay/40 rounded-full" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-rosevia-charcoal truncate">{item.name}</p>
                        <p className={`text-[9px] ${item.remainingTablets <= 5 ? "text-rosevia-terracotta" : "text-rosevia-gold"} font-bold`}>
                          {item.remainingTablets || 0} left
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => logTakePill(item.id, item.name)}
                      disabled={!item.remainingTablets || item.remainingTablets <= 0}
                      className="px-2 py-1 rounded bg-rosevia-gold/15 hover:bg-rosevia-gold hover:text-rosevia-cream text-[8px] font-bold uppercase tracking-wider text-rosevia-gold transition-all duration-300 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                    >
                      Dose
                    </button>
                  </div>
                ))}
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
                    ? "bg-rosevia-gold text-rosevia-cream shadow"
                    : "text-rosevia-clay bg-rosevia-cream border border-rosevia-rose/20 hover:border-rosevia-gold/40"
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
          <div className={`${currentTheme.card} p-6 flex flex-col justify-between space-y-5 shadow-sm`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Sun size={18} className="text-rosevia-gold animate-spin duration-10000" />
                <h4 className="text-sm font-serif font-bold text-rosevia-clay uppercase tracking-wider">AM Protective Ritual</h4>
              </div>
              <span className="text-[9px] font-bold tracking-wider uppercase bg-rosevia-rose/20 px-2.5 py-1 rounded text-rosevia-clay">
                {activeRoutineDetails.am.length} Layers
              </span>
            </div>

            <div className="space-y-3.5 flex-1">
              {activeRoutineDetails.am.map((product, idx) => (
                <div 
                  key={idx}
                  className="flex items-start bg-rosevia-cream/80 border border-rosevia-rose/20 rounded-xl p-3.5 hover:border-rosevia-gold/40 transition-all shadow-xs"
                >
                  <div className="w-6 h-6 rounded-full border border-rosevia-rose/40 bg-rosevia-cream flex items-center justify-center shrink-0 mt-0.5 mr-3.5 text-[10px] font-bold text-rosevia-gold shadow-xs">
                    {idx + 1}
                  </div>
                  <div>
                    <p className={`text-xs font-bold text-rosevia-charcoal ${completedAM ? "line-through text-rosevia-clay/45" : ""}`}>
                      {product}
                    </p>
                    <p className="text-[10px] text-rosevia-clay mt-1 font-semibold leading-relaxed">
                      {product.includes("Cleans") ? "Lather onto damp face, wash off with lukewarm water." :
                       product.includes("Vit") || product.includes("Niacin") || product.includes("Serum") ? `Pat into skin at your scheduled ${reminders.serumTimeAM} AM alarm, wait 2 mins.` :
                       product.includes("SPF") || product.includes("Sunscreen") ? `Apply final protective lock at scheduled ${reminders.spfTime} AM.` :
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
                className={`w-full py-4 rounded-xl text-rosevia-cream text-xs tracking-widest font-bold uppercase shadow hover:shadow-md duration-300 cursor-pointer flex items-center justify-center ${currentTheme.button}`}
              >
                Log AM Completed <Check size={14} className="ml-2 stroke-[3]" />
              </button>
            )}
          </div>

          {/* PM Routine Checklist */}
          <div className={`${currentTheme.card} p-6 flex flex-col justify-between space-y-5 shadow-sm`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Moon size={18} className="text-rosevia-clay" />
                <h4 className="text-sm font-serif font-bold text-rosevia-clay uppercase tracking-wider">PM Restorative Ritual</h4>
              </div>
              <span className="text-[9px] font-bold tracking-wider uppercase bg-rosevia-rose/20 px-2.5 py-1 rounded text-rosevia-clay">
                {activeRoutineDetails.pm.length} Layers
              </span>
            </div>

            <div className="space-y-3.5 flex-1">
              {activeRoutineDetails.pm.map((product, idx) => (
                <div 
                  key={idx}
                  className="flex items-start bg-rosevia-cream/80 border border-rosevia-rose/20 rounded-xl p-3.5 hover:border-rosevia-gold/40 transition-all shadow-xs"
                >
                  <div className="w-6 h-6 rounded-full border border-rosevia-rose/40 bg-rosevia-cream flex items-center justify-center shrink-0 mt-0.5 mr-3.5 text-[10px] font-bold text-rosevia-gold shadow-xs">
                    {idx + 1}
                  </div>
                  <div>
                    <p className={`text-xs font-bold text-rosevia-charcoal ${completedPM ? "line-through text-rosevia-clay/45" : ""}`}>
                      {product}
                    </p>
                    <p className="text-[10px] text-rosevia-clay mt-1 font-semibold leading-relaxed">
                      {product.includes("Salic") || product.includes("Glycol") || product.includes("Retin") ? (
                        <span className="text-rosevia-terracotta font-semibold flex items-center mt-0.5">
                          <Clock size={10} className="mr-1" /> Active Layer scheduled at {reminders.serumTimePM} PM — Wait 5 mins.
                        </span>
                      ) : product.includes("Cleans") ? (
                        "Double cleanse: 1 min oil wash, 1 min water lather."
                      ) : (
                        `Tap over active layers to form an emollient moisture seal at ${reminders.moistTimePM} PM.`
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
                className={`w-full py-4 rounded-xl text-rosevia-cream text-xs tracking-widest font-bold uppercase shadow hover:shadow-md duration-300 cursor-pointer flex items-center justify-center ${currentTheme.button}`}
              >
                Log PM Completed <Check size={14} className="ml-2 stroke-[3]" />
              </button>
            )}
          </div>

        </div>

        {/* Skincare Coaching Tips Panel */}
        <div className={`${currentTheme.card} p-6 shadow-sm`}>
          <h4 className="text-xs font-bold tracking-widest uppercase text-rosevia-clay mb-3">Skin Coaching Tips</h4>
          <div className="space-y-2">
            {routine.tips.map((tip, idx) => (
              <div key={idx} className="flex items-start text-xs text-rosevia-clay leading-relaxed bg-rosevia-cream/80 p-3 rounded-xl border border-rosevia-rose/20 shadow-xs">
                <span className="text-rosevia-gold font-bold mr-2">✦</span>
                <p className="font-semibold">{tip}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* FLOATING BOTTOM PREMIUM NAVIGATION DOCK (BALANCED FOR 7 ITEMS) */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-lg glass-panel py-3 px-4 rounded-2xl flex justify-between items-center shadow-lg border border-rosevia-rose/40 z-50">
        <button 
          onClick={() => navigateTo("/")}
          className="flex flex-col items-center text-rosevia-gold shrink-0 cursor-pointer"
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
          onClick={() => navigateTo("/calendar")}
          className="flex flex-col items-center text-rosevia-clay hover:text-rosevia-gold shrink-0 cursor-pointer"
        >
          <Calendar size={18} />
          <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">Calendar</span>
        </button>
        <button 
          onClick={() => navigateTo("/journal")}
          className="flex flex-col items-center text-rosevia-clay hover:text-rosevia-gold shrink-0 cursor-pointer animate-none"
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

