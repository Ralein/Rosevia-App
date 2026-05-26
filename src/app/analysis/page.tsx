"use client";

import { useState, useEffect } from "react";
import { 
  Camera, 
  Sparkles, 
  Activity, 
  Layers, 
  FolderHeart, 
  AlertCircle, 
  MessageSquareHeart, 
  BookOpen,
  TrendingUp, 
  ShieldCheck, 
  UploadCloud,
  Loader2
} from "lucide-react";

export default function SkinAnalysis() {
  const [profile, setProfile] = useState<any>(null);
  const [image, setImage] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [showReport, setShowReport] = useState(false);

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
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImage(event.target.result as string);
          setShowReport(false);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const startVisualScan = () => {
    setScanning(true);
    setScanStep(1);
    
    setTimeout(() => setScanStep(2), 1200);
    setTimeout(() => setScanStep(3), 2400);
    setTimeout(() => {
      setScanning(false);
      setShowReport(true);
      setScanStep(0);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-rosevia-cream text-rosevia-charcoal pb-28 select-none">
      
      <div className="max-w-4xl mx-auto px-4 pt-6 md:pt-10 flex flex-col space-y-6 animate-fade-in">
        
        {/* Header Title */}
        <header className="flex justify-between items-start">
          <div>
            <h1 className="text-xs tracking-widest font-bold text-rosevia-clay uppercase">AI Biological Diagnostics</h1>
            <p className="text-2xl md:text-3xl font-serif text-rosevia-charcoal tracking-tight font-light mt-1">
              Weekly Selfie <span className="italic text-rosevia-rose font-normal">Skin Scan</span>
            </p>
          </div>
          <div className="px-3 py-1 bg-rosevia-rose/15 border border-rosevia-rose/30 rounded-full text-[10px] tracking-wider uppercase font-bold text-rosevia-rose">
            Routine Ritual
          </div>
        </header>

        {/* Main Workspace split */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Selfie Upload & Animated Scanning Panel */}
          <div className="md:col-span-5 glass-card p-5 space-y-4 flex flex-col items-center shadow-sm">
            <h3 className="text-xs font-semibold tracking-widest uppercase text-rosevia-clay self-start">Selfie Capture</h3>
            
            <div className="relative w-full aspect-[3/4] max-w-[280px] bg-white border border-rosevia-rose/30 rounded-2xl overflow-hidden flex flex-col items-center justify-center text-center shadow-inner group">
              {image ? (
                <>
                  <img src={image} alt="Selfie upload" className="w-full h-full object-cover" />
                  
                  {scanning && (
                    <div className="absolute left-0 w-full h-[3px] bg-rosevia-gold/90 shadow-[0_0_12px_#C2B095] animate-scan z-20" />
                  )}

                  {/* Pulsing zone indicators */}
                  {scanning && (
                    <>
                      {/* T-Zone */}
                      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border border-rosevia-gold/80 animate-pulse-ring flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-rosevia-gold" />
                      </div>
                      {/* Cheeks */}
                      <div className="absolute top-[48%] left-[28%] w-8 h-8 rounded-full border border-rosevia-gold/80 animate-pulse-ring flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-rosevia-gold" />
                      </div>
                      <div className="absolute top-[48%] right-[28%] w-8 h-8 rounded-full border border-rosevia-gold/80 animate-pulse-ring flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-rosevia-gold" />
                      </div>
                      {/* Chin */}
                      <div className="absolute bottom-[22%] left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border border-rosevia-gold/80 animate-pulse-ring flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-rosevia-gold" />
                      </div>
                    </>
                  )}
                </>
              ) : (
                /* GORGEOUS CLINICAL SVG FACE WIREFRAME PLACEHOLDER */
                <div className="w-full h-full p-6 flex flex-col items-center justify-center space-y-4 bg-gradient-to-b from-rosevia-cream/50 to-white relative">
                  <svg className="w-32 h-32 text-rosevia-rose/65 animate-pulse" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2">
                    {/* Face Oval */}
                    <path d="M50,15 C28,15 28,50 28,68 C28,82 38,88 50,88 C62,88 72,82 72,68 C72,50 72,15 50,15 Z" strokeDasharray="3 3" />
                    {/* Eyes */}
                    <ellipse cx="40" cy="46" rx="4" ry="2" />
                    <ellipse cx="60" cy="46" rx="4" ry="2" />
                    {/* Nose line */}
                    <path d="M50,42 L50,60 L47,60" />
                    {/* Lips */}
                    <path d="M44,70 C47,72 53,72 56,70" />
                    <path d="M46,70 C48,69 52,69 54,70" />
                    {/* Crosshair grid lines */}
                    <line x1="50" y1="5" x2="50" y2="95" strokeWidth="0.5" strokeOpacity="0.4" />
                    <line x1="5" y1="50" x2="95" y2="50" strokeWidth="0.5" strokeOpacity="0.4" />
                  </svg>
                  
                  <div className="space-y-1 z-10">
                    <p className="text-xs font-bold text-rosevia-clay tracking-wider uppercase">Biological Diagnostics</p>
                    <p className="text-[10px] text-rosevia-clay/65 leading-relaxed max-w-[200px] font-medium mx-auto">
                      Provide a clear facial selfie. The AI will draw scan layers and compute deep index scores.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Simulated Calibration Text */}
            {scanning && (
              <div className="bg-rosevia-cream/80 border border-rosevia-rose/40 rounded-xl p-3 w-full text-center shadow-xs">
                <p className="text-xs font-bold text-rosevia-clay flex items-center justify-center animate-pulse">
                  <Activity size={12} className="mr-1.5 animate-spin text-rosevia-gold" />
                  {scanStep === 1 && "Calibrating T-Zone Sebum Lipids..."}
                  {scanStep === 2 && "Auditing Cheek Vascular Redness..."}
                  {scanStep === 3 && "Extracting Stratum Corneum Hydration..."}
                </p>
              </div>
            )}

            {/* Controls */}
            <div className="w-full flex flex-col space-y-2 pt-2">
              <label className="w-full py-3.5 rounded-xl border border-dashed border-rosevia-rose bg-white hover:bg-rosevia-rose/10 transition-all text-xs tracking-widest font-bold uppercase text-rosevia-clay text-center cursor-pointer block shadow-xs">
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
                  className="w-full py-4 rounded-xl bg-rosevia-clay text-rosevia-cream text-xs tracking-widest font-bold uppercase hover:bg-rosevia-charcoal transition-all cursor-pointer flex items-center justify-center shadow-md transform hover:-translate-y-0.5"
                >
                  <Camera size={14} className="mr-2" /> Start AI Diagnostics
                </button>
              )}
            </div>
          </div>

          {/* Clinical Diagnostic Report Panel */}
          <div className="md:col-span-7 space-y-4">
            {showReport ? (
              <div className="space-y-5 animate-fade-in">
                
                {/* Score Header Card with SVG Circular Progress Ring */}
                <div className="glass-card p-6 flex items-center gap-6 shadow-sm">
                  {/* Glowing Radial SVG Gauge */}
                  <div className="relative shrink-0 w-24 h-24 flex items-center justify-center">
                    <svg className="absolute w-full h-full transform -rotate-90">
                      <circle cx="48" cy="48" r="40" stroke="#EAD2C6" strokeWidth="4.5" fill="transparent" opacity="0.3" />
                      <circle 
                        cx="48" 
                        cy="48" 
                        r="40" 
                        stroke="url(#skinIndexGrad)" 
                        strokeWidth="5" 
                        fill="transparent" 
                        strokeDasharray={251}
                        strokeDashoffset={251 - (251 * 84) / 100} 
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                      <defs>
                        <linearGradient id="skinIndexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#C2B095" />
                          <stop offset="100%" stopColor="#607C70" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="flex flex-col items-center justify-center z-10 mt-1">
                      <span className="text-3xl font-serif font-bold text-rosevia-clay leading-none">84</span>
                      <span className="text-[8px] font-bold text-rosevia-clay/60 uppercase tracking-widest mt-1">Index</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <div className="inline-flex items-center space-x-1.5 bg-rosevia-green text-rosevia-rose px-2.5 py-0.5 rounded text-[9px] font-bold uppercase border border-rosevia-rose/20">
                      <ShieldCheck size={10} /> <span>Barrier Stable</span>
                    </div>
                    <h3 className="text-base font-serif font-bold text-rosevia-clay">Clinical Diagnosis</h3>
                    <p className="text-xs text-rosevia-clay/85 leading-relaxed font-medium">
                      Redness and texture show a **+3.4% improvement** compared to May 19. Pore sebum congestion has dropped by 8% due to active BHA toner adherence.
                    </p>
                  </div>
                </div>

                {/* Score Breakdown Slider Cards */}
                <div className="glass-card p-6 space-y-4 shadow-sm">
                  <h4 className="text-xs font-bold tracking-widest uppercase text-rosevia-clay">Metric Breakdowns</h4>
                  
                  <div className="space-y-4">
                    {[
                      { label: "Barrier Calmness (Redness)", score: 89, color: "bg-rosevia-rose" },
                      { label: "Epidermal Texture (Smoothness)", score: 81, color: "bg-rosevia-rose" },
                      { label: "Pore Congestion (Sebum Balance)", score: 78, color: "bg-rosevia-gold" },
                      { label: "Deep Cellular Hydration", score: 85, color: "bg-rosevia-clay" },
                      { label: "Elasticity (Fine Lines)", score: 92, color: "bg-rosevia-terracotta" }
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold text-rosevia-clay">
                          <span>{item.label}</span>
                          <span>{item.score}%</span>
                        </div>
                        <div className="w-full h-2 bg-rosevia-cream border border-rosevia-rose/25 rounded-full overflow-hidden shadow-xs">
                          <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.score}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Explanatory Diagnosis */}
                <div className="glass-card p-6 space-y-3.5 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <Sparkles size={16} className="text-rosevia-gold" />
                    <h4 className="text-xs font-bold tracking-widest uppercase text-rosevia-clay">Derm AI Diagnostics</h4>
                  </div>
                  <p className="text-xs text-rosevia-clay/90 leading-relaxed font-medium">
                    "Excellent progress, redness is significantly down! The Centella Asiatica serum added to your calm cycle is actively cooling vascular tissues. We notice deep cellular hydration has climbed to 85%, responding well to your water intake logs. 
                    <br /><br />
                    **Recommended Adjustment**: Since pores remain slightly congested at 78%, increase your **Salicylic Acid (BHA)** toner application strictly on Tuesdays and Fridays in your PM cycle. Layer under your moisturizer on completely dry skin to refine lipids without distressing the barrier."
                  </p>
                </div>

                {/* Before / After Progression Map */}
                <div className="glass-card p-6 space-y-3.5 shadow-sm">
                  <h4 className="text-xs font-bold tracking-widest uppercase text-rosevia-clay">Historical Progress Chart</h4>
                  <div className="flex justify-between items-center text-center bg-white/40 border border-rosevia-rose/20 rounded-2xl p-5 shadow-xs">
                    <div>
                      <p className="text-[9px] tracking-wider uppercase font-bold text-rosevia-clay/65">Week 1 (May 5)</p>
                      <p className="text-xs font-bold text-rosevia-clay/70 mt-1">79 Index</p>
                    </div>
                    <TrendingUp size={16} className="text-rosevia-rose/50" />
                    <div>
                      <p className="text-[9px] tracking-wider uppercase font-bold text-rosevia-clay/65">Week 2 (May 12)</p>
                      <p className="text-xs font-bold text-rosevia-clay/70 mt-1">80 Index</p>
                    </div>
                    <TrendingUp size={16} className="text-rosevia-gold animate-bounce" />
                    <div>
                      <p className="text-[9px] tracking-wider uppercase font-bold text-rosevia-clay">Current (May 26)</p>
                      <p className="text-sm font-bold text-rosevia-clay mt-1">84 Index</p>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              /* Instructions Placeholder when not analyzed */
              <div className="glass-card p-8 text-center flex flex-col items-center justify-center space-y-4 aspect-[4/3] md:aspect-[4/2.5] shadow-sm bg-white/50">
                <div className="w-12 h-12 rounded-full bg-rosevia-rose/20 flex items-center justify-center">
                  <Camera size={22} className="text-rosevia-clay" />
                </div>
                <h3 className="text-base font-serif font-bold text-rosevia-clay uppercase tracking-wide">Provide a photo to activate diagnostics</h3>
                <p className="text-xs text-rosevia-clay/80 max-w-sm leading-relaxed font-medium">
                  Upload a clear facial selfie. The AI will draw scan layers and compute deep index scores.
                </p>
              </div>
            )}
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
          className="flex flex-col items-center text-rosevia-gold shrink-0 cursor-pointer"
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
