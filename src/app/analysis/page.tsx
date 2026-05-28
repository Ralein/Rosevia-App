"use client";

import { useState, useEffect } from "react";
import { 
  Camera, 
  Sparkles, 
  Activity, 
  Layers, 
  FolderHeart, 
  AlertCircle, 
  BookOpen,
  ShieldCheck, 
  Loader2,
  Settings
} from "lucide-react";

export default function SkinAnalysis() {
  const [profile, setProfile] = useState<any>(null);
  const [image, setImage] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [report, setReport] = useState<any>(null);
  const [theme, setTheme] = useState("Midnight Jade");

  const navigateTo = (path: string) => {
    window.location.href = path;
  };

  useEffect(() => {
    const savedProfile = localStorage.getItem("rosevia_profile");
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    } else {
      setProfile({ skinType: "Combination", concerns: ["Acne", "Redness"] });
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
          accent: "text-rosevia-rosegold",
          gold: "text-rosevia-rose-light",
          button: "bg-rosevia-rose-light text-rosevia-plum hover:bg-rosevia-rosegold hover:text-rosevia-plum",
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImage(event.target.result as string);
          setReport(null);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const startVisualScan = async () => {
    if (!image) return;
    setScanning(true);
    setScanStep(1);
    setReport(null);

    const step2Timer = setTimeout(() => setScanStep(2), 1200);
    const step3Timer = setTimeout(() => setScanStep(3), 2400);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "scanSelfie",
          image,
          skinType: profile?.skinType || "Combination",
          concerns: profile?.concerns || ["Acne"]
        })
      });
      const data = await response.json();
      if (data.report) {
        setReport(data.report);
      }
    } catch (error) {
      console.error("Selfie scan failed:", error);
    } finally {
      clearTimeout(step2Timer);
      clearTimeout(step3Timer);
      setScanning(false);
      setScanStep(0);
    }
  };

  const metricsData = report?.metrics
    ? [
        { label: "Barrier Calmness (Redness)", score: report.metrics.redness, color: theme === "Rose Quartz Luxury" ? "bg-rosevia-rose-light" : "bg-rosevia-rose" },
        { label: "Epidermal Texture (Smoothness)", score: report.metrics.smoothness, color: theme === "Rose Quartz Luxury" ? "bg-rosevia-rosegold" : "bg-rosevia-gold" },
        { label: "Pore Congestion (Sebum Balance)", score: report.metrics.sebum, color: "bg-rosevia-clay" },
        { label: "Deep Cellular Hydration", score: report.metrics.hydration, color: theme === "Rose Quartz Luxury" ? "bg-rosevia-plum-glow" : "bg-rosevia-sage" },
        { label: "Elasticity (Fine Lines)", score: report.metrics.elasticity, color: "bg-rosevia-terracotta" }
      ]
    : [];

  return (
    <div className={`min-h-screen ${currentTheme.bg} pb-28 select-none transition-colors duration-500`}>
      
      <div className="max-w-4xl mx-auto px-4 pt-6 md:pt-10 flex flex-col space-y-6 animate-fade-in">
        
        {/* Header Title */}
        <header className="flex justify-between items-start">
          <div>
            <h1 className={`text-xs tracking-widest font-bold ${currentTheme.accent} uppercase`}>AI Biological Diagnostics</h1>
            <p className="text-2xl md:text-3xl font-serif tracking-tight font-light mt-1">
              Weekly Selfie <span className={`italic ${currentTheme.gold} font-normal`}>Skin Scan</span>
            </p>
          </div>
          
          <button 
            onClick={() => navigateTo("/")}
            className={`w-10 h-10 rounded-full bg-gradient-to-tr ${
              theme === "Rose Quartz Luxury" 
                ? "from-rosevia-rosegold/30 to-rosevia-rose-light/30 border-rosevia-rosegold/50" 
                : "from-rosevia-gold/30 to-rosevia-rose/30 border-rosevia-gold/50"
            } border flex items-center justify-center font-serif text-xs font-bold ${currentTheme.gold} hover:shadow-lg transition-all shrink-0 cursor-pointer`}
          >
            RN
          </button>
        </header>

        {/* Main Workspace split */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Selfie Upload & Animated Scanning Panel */}
          <div className={`md:col-span-5 ${currentTheme.card} p-5 space-y-4 flex flex-col items-center shadow-sm`}>
            <h3 className={`text-xs font-semibold tracking-widest uppercase ${currentTheme.accent} self-start`}>Selfie Capture</h3>
            
            <div className={`relative w-full aspect-[3/4] max-w-[280px] ${
              theme === "Rose Quartz Luxury" ? "bg-rosevia-rose-dark border-rosevia-rose-light/25" : "bg-rosevia-sand border-rosevia-rose/25"
            } border rounded-2xl overflow-hidden flex flex-col items-center justify-center text-center shadow-inner group`}>
              {image ? (
                <>
                  <img src={image} alt="Selfie upload" className="w-full h-full object-cover" />
                  
                  {scanning && (
                    <div className={`absolute left-0 w-full h-[3px] ${
                      theme === "Rose Quartz Luxury" ? "bg-rosevia-rose-light/95 shadow-[0_0_12px_#E07A9A]" : "bg-rosevia-gold/90 shadow-[0_0_12px_#D4AF37]"
                    } animate-scan z-20`} />
                  )}

                  {/* Pulsing zone indicators */}
                  {scanning && (
                    <>
                      <div className={`absolute top-[20%] left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border ${
                        theme === "Rose Quartz Luxury" ? "border-rosevia-rose-light/80" : "border-rosevia-gold/80"
                      } animate-pulse-ring flex items-center justify-center`}>
                        <div className={`w-2 h-2 rounded-full ${theme === "Rose Quartz Luxury" ? "bg-rosevia-rose-light" : "bg-rosevia-gold"}`} />
                      </div>
                      <div className={`absolute top-[48%] left-[28%] w-8 h-8 rounded-full border ${
                        theme === "Rose Quartz Luxury" ? "border-rosevia-rose-light/80" : "border-rosevia-gold/80"
                      } animate-pulse-ring flex items-center justify-center`}>
                        <div className={`w-2 h-2 rounded-full ${theme === "Rose Quartz Luxury" ? "bg-rosevia-rose-light" : "bg-rosevia-gold"}`} />
                      </div>
                      <div className={`absolute top-[48%] right-[28%] w-8 h-8 rounded-full border ${
                        theme === "Rose Quartz Luxury" ? "border-rosevia-rose-light/80" : "border-rosevia-gold/80"
                      } animate-pulse-ring flex items-center justify-center`}>
                        <div className={`w-2 h-2 rounded-full ${theme === "Rose Quartz Luxury" ? "bg-rosevia-rose-light" : "bg-rosevia-gold"}`} />
                      </div>
                      <div className={`absolute bottom-[22%] left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border ${
                        theme === "Rose Quartz Luxury" ? "border-rosevia-rose-light/80" : "border-rosevia-gold/80"
                      } animate-pulse-ring flex items-center justify-center`}>
                        <div className={`w-2 h-2 rounded-full ${theme === "Rose Quartz Luxury" ? "bg-rosevia-rose-light" : "bg-rosevia-gold"}`} />
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className={`w-full h-full p-6 flex flex-col items-center justify-center space-y-4 bg-gradient-to-b ${
                  theme === "Rose Quartz Luxury" ? "from-rosevia-rose-dark/65 to-rosevia-plum" : "from-[#111C18]/60 to-[#060D0B]"
                } relative`}>
                  <svg className={`w-32 h-32 ${theme === "Rose Quartz Luxury" ? "text-rosevia-rose-light/75" : "text-rosevia-gold/75"} animate-pulse`} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <path d="M50,15 C28,15 28,50 28,68 C28,82 38,88 50,88 C62,88 72,82 72,68 C72,50 72,15 50,15 Z" strokeDasharray="3 3" />
                    <ellipse cx="40" cy="46" rx="4" ry="2" />
                    <ellipse cx="60" cy="46" rx="4" ry="2" />
                    <path d="M50,42 L50,60 L47,60" />
                    <path d="M44,70 C47,72 53,72 56,70" />
                    <path d="M46,70 C48,69 52,69 54,70" />
                    <line x1="50" y1="5" x2="50" y2="95" strokeWidth="0.5" strokeOpacity="0.4" />
                    <line x1="5" y1="50" x2="95" y2="50" strokeWidth="0.5" strokeOpacity="0.4" />
                  </svg>
                  
                  <div className="space-y-1 z-10">
                    <p className={`text-xs font-bold ${currentTheme.gold} tracking-wider uppercase`}>Biological Diagnostics</p>
                    <p className={`text-[9px] ${currentTheme.accent} leading-relaxed max-w-[200px] font-semibold mx-auto`}>
                      Provide a clear facial selfie. The AI will draw scan layers and compute deep index scores.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Calibration Text */}
            {scanning && (
              <div className={`border ${theme === "Rose Quartz Luxury" ? "bg-rosevia-rose-dark border-rosevia-rose-light/25" : "bg-rosevia-cream border-rosevia-rose/25"} rounded-xl p-3 w-full text-center shadow-xs`}>
                <p className={`text-xs font-bold ${currentTheme.accent} flex items-center justify-center animate-pulse`}>
                  <Activity size={12} className={`mr-1.5 animate-spin ${currentTheme.gold}`} />
                  {scanStep === 1 && "Calibrating T-Zone Sebum Lipids..."}
                  {scanStep === 2 && "Auditing Cheek Vascular Redness..."}
                  {scanStep === 3 && "Extracting Stratum Corneum Hydration..."}
                </p>
              </div>
            )}

            {/* Controls */}
            <div className="w-full flex flex-col space-y-2 pt-2">
              <label className={`w-full py-3.5 rounded-xl border border-dashed ${
                theme === "Rose Quartz Luxury" 
                  ? "border-rosevia-rose-light bg-rosevia-rose-dark/65 hover:bg-rosevia-rose-light/10" 
                  : "border-rosevia-rose bg-rosevia-cream/65 hover:bg-rosevia-rose/10"
              } transition-all text-xs tracking-widest font-bold uppercase ${currentTheme.accent} text-center cursor-pointer block shadow-xs`}>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  className="hidden" 
                />
                Choose Photo
              </label>
              {image && !scanning && (
                <button
                  onClick={startVisualScan}
                  className={`w-full py-4 rounded-xl text-rosevia-cream text-xs tracking-widest font-bold uppercase transition-all cursor-pointer flex items-center justify-center shadow-md transform hover:-translate-y-0.5 ${currentTheme.button}`}
                >
                  {scanning ? <Loader2 size={14} className="animate-spin mr-2" /> : <Camera size={14} className="mr-2" />} Start AI Diagnostics
                </button>
              )}
            </div>
          </div>

          {/* Clinical Diagnostic Report Panel */}
          <div className="md:col-span-7 space-y-4">
            {report ? (
              <div className="space-y-5 animate-fade-in">
                
                {/* Score Header Card with SVG Circular Progress Ring */}
                <div className={`${currentTheme.card} p-6 flex items-center gap-6 shadow-sm`}>
                  <div className="relative shrink-0 w-24 h-24 flex items-center justify-center">
                    <svg className="absolute w-full h-full transform -rotate-90">
                      <circle cx="48" cy="48" r="40" stroke={theme === "Rose Quartz Luxury" ? "#251117" : "#111C18"} strokeWidth="4.5" fill="transparent" opacity="0.3" />
                      <circle 
                        cx="48" 
                        cy="48" 
                        r="40" 
                        stroke="url(#skinIndexGrad)" 
                        strokeWidth="5" 
                        fill="transparent" 
                        strokeDasharray={251}
                        strokeDashoffset={251 - (251 * (report.score || 0)) / 100} 
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                      <defs>
                        <linearGradient id="skinIndexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor={theme === "Rose Quartz Luxury" ? "#E8C1C8" : "#D4AF37"} />
                          <stop offset="100%" stopColor={theme === "Rose Quartz Luxury" ? "#E07A9A" : "#688A7D"} />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="flex flex-col items-center justify-center z-10 mt-1">
                      <span className={`text-3xl font-serif font-bold ${currentTheme.gold} leading-none`}>{report.score || 0}</span>
                      <span className={`text-[8px] font-bold ${currentTheme.accent} uppercase tracking-widest mt-1`}>Index</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <div className="inline-flex items-center space-x-1.5 bg-rosevia-green text-rosevia-rose px-2.5 py-0.5 rounded text-[9px] font-bold uppercase border border-rosevia-rose/20">
                      <ShieldCheck size={10} /> <span>{report.barrierStatus || "Analyzing..."}</span>
                    </div>
                    <h3 className={`text-base font-serif font-bold ${currentTheme.gold}`}>Clinical Diagnosis</h3>
                    <p className={`text-xs ${currentTheme.accent} leading-relaxed font-semibold`}>
                      {report.diagnosis || "Processing diagnostic data..."}
                    </p>
                  </div>
                </div>

                {/* Score Breakdown Slider Cards */}
                {metricsData.length > 0 && (
                  <div className={`${currentTheme.card} p-6 space-y-4 shadow-sm`}>
                    <h4 className={`text-xs font-bold tracking-widest uppercase ${currentTheme.accent}`}>Metric Breakdowns</h4>
                    
                    <div className="space-y-4">
                      {metricsData.map((item, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <div className={`flex justify-between text-xs font-bold ${currentTheme.accent}`}>
                            <span>{item.label}</span>
                            <span className={currentTheme.gold}>{item.score}%</span>
                          </div>
                          <div className="w-full h-2 bg-rosevia-cream border border-rosevia-rose/20 rounded-full overflow-hidden shadow-xs">
                            <div className={`h-full ${item.color} rounded-full transition-all duration-700`} style={{ width: `${item.score}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Explanatory Diagnosis */}
                <div className={`${currentTheme.card} p-6 space-y-3.5 shadow-sm`}>
                  <div className="flex items-center space-x-2">
                    <Sparkles size={16} className={currentTheme.gold} />
                    <h4 className={`text-xs font-bold tracking-widest uppercase ${currentTheme.accent}`}>Derm AI Diagnostics</h4>
                  </div>
                  <p className={`text-xs ${currentTheme.accent} leading-relaxed font-semibold whitespace-pre-line`}>
                    {report.explanation || "Generating AI analysis..."}
                  </p>
                </div>

              </div>
            ) : (
              /* Instructions Placeholder when not analyzed */
              <div className={`${currentTheme.card} p-8 text-center flex flex-col items-center justify-center space-y-4 aspect-[4/3] md:aspect-[4/2.5] shadow-sm`}>
                <div className={`w-12 h-12 rounded-full ${theme === "Rose Quartz Luxury" ? "bg-rosevia-rose-light/25 border-rosevia-rosegold/30" : "bg-rosevia-rose/25 border-rosevia-gold/30"} flex items-center justify-center border`}>
                  <Camera size={22} className={`${currentTheme.gold} animate-pulse`} />
                </div>
                <h3 className={`text-sm font-serif font-bold ${currentTheme.gold} uppercase tracking-wide`}>Provide a photo to activate diagnostics</h3>
                <p className={`text-xs ${currentTheme.accent} max-w-sm leading-relaxed font-semibold`}>
                  Upload a clear facial selfie. The AI will draw scan layers and compute deep index scores.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* FLOATING BOTTOM PREMIUM NAVIGATION DOCK */}
      <nav className={`fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md py-3.5 px-6 rounded-2xl flex justify-between items-center shadow-lg backdrop-blur-md z-50 ${
        theme === "Rose Quartz Luxury"
          ? "bg-rosevia-rose-dark/90 border border-rosevia-rose-light/30 text-rosevia-charcoal"
          : "bg-[#060D0B]/88 border border-rosevia-gold/20 text-rosevia-charcoal"
      }`}>
        <button 
          onClick={() => navigateTo("/")}
          className={`flex flex-col items-center ${theme === "Rose Quartz Luxury" ? "text-rosevia-rosegold/60 hover:text-rosevia-rosegold" : "text-rosevia-clay hover:text-rosevia-gold"} shrink-0 cursor-pointer`}
        >
          <Layers size={18} />
          <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">Home</span>
        </button>
        <button 
          onClick={() => navigateTo("/analysis")}
          className={`flex flex-col items-center ${currentTheme.gold} shrink-0 cursor-pointer`}
        >
          <Activity size={18} />
          <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">Scan</span>
        </button>
        <button 
          onClick={() => navigateTo("/cabinet")}
          className={`flex flex-col items-center ${theme === "Rose Quartz Luxury" ? "text-rosevia-rosegold/60 hover:text-rosevia-rosegold" : "text-rosevia-clay hover:text-rosevia-gold"} shrink-0 cursor-pointer`}
        >
          <FolderHeart size={18} />
          <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">Cabinet</span>
        </button>
        <button 
          onClick={() => navigateTo("/checker")}
          className={`flex flex-col items-center ${theme === "Rose Quartz Luxury" ? "text-rosevia-rosegold/60 hover:text-rosevia-rosegold" : "text-rosevia-clay hover:text-rosevia-gold"} shrink-0 cursor-pointer`}
        >
          <AlertCircle size={18} />
          <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">Checker</span>
        </button>
        <button 
          onClick={() => navigateTo("/journal")}
          className={`flex flex-col items-center ${theme === "Rose Quartz Luxury" ? "text-rosevia-rosegold/60 hover:text-rosevia-rosegold" : "text-rosevia-clay hover:text-rosevia-gold"} shrink-0 cursor-pointer`}
        >
          <BookOpen size={18} />
          <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">Diary</span>
        </button>
        <button 
          onClick={() => navigateTo("/settings")}
          className={`flex flex-col items-center ${theme === "Rose Quartz Luxury" ? "text-rosevia-rosegold/60 hover:text-rosevia-rosegold" : "text-rosevia-clay hover:text-rosevia-gold"} shrink-0 cursor-pointer`}
        >
          <Settings size={18} />
          <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">Settings</span>
        </button>
      </nav>

    </div>
  );
}
