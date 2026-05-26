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
  FileText,
  UploadCloud,
  CheckCircle2,
  Users
} from "lucide-react";

export default function SkinAnalysis() {
  const [profile, setProfile] = useState<any>(null);
  const [image, setImage] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [showReport, setShowReport] = useState(false);
  
  // Custom mock sample faces to make testing beautiful and instant
  const sampleSelfies = [
    { id: "skin1", label: "Model Face A (Slight redness)", url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop" },
    { id: "skin2", label: "Model Face B (Balanced glow)", url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&auto=format&fit=crop" }
  ];

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

  const selectSampleSelfie = (url: string) => {
    setImage(url);
    setShowReport(false);
  };

  const startVisualScan = () => {
    setScanning(true);
    setScanStep(1);
    
    // Step-by-step scanner prompts
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
              Weekly Selfie <span className="italic text-rosevia-clay font-normal">Skin Scan</span>
            </p>
          </div>
          <div className="px-3 py-1 bg-rosevia-gold/15 border border-rosevia-gold/30 rounded-full text-[10px] tracking-wider uppercase font-bold text-rosevia-clay">
            Routine Ritual
          </div>
        </header>

        {/* Main Workspace split */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Selfie Upload & Animated Scanning Panel */}
          <div className="md:col-span-5 glass-card p-5 space-y-4 flex flex-col items-center">
            <h3 className="text-xs font-semibold tracking-widest uppercase text-rosevia-clay self-start">Selfie Capture</h3>
            
            <div className="relative w-full aspect-[3/4] max-w-[280px] bg-rosevia-cream border border-rosevia-rose/30 rounded-2xl overflow-hidden flex flex-col items-center justify-center text-center shadow-inner group">
              {image ? (
                <>
                  {/* Uploaded Photo */}
                  <img src={image} alt="Selfie upload" className="w-full h-full object-cover" />
                  
                  {/* Animated laser scan lines */}
                  {scanning && (
                    <div className="absolute left-0 w-full h-[3px] bg-rosevia-gold/90 shadow-[0_0_12px_#C5A880] animate-scan" />
                  )}

                  {/* Pulsing zone indicators */}
                  {scanning && (
                    <>
                      {/* T-Zone */}
                      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border border-rosevia-rose/80 animate-pulse-ring flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-rosevia-gold" />
                      </div>
                      {/* Cheeks */}
                      <div className="absolute top-[48%] left-[28%] w-8 h-8 rounded-full border border-rosevia-rose/80 animate-pulse-ring flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-rosevia-gold" />
                      </div>
                      <div className="absolute top-[48%] right-[28%] w-8 h-8 rounded-full border border-rosevia-rose/80 animate-pulse-ring flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-rosevia-gold" />
                      </div>
                      {/* Chin */}
                      <div className="absolute bottom-[22%] left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border border-rosevia-rose/80 animate-pulse-ring flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-rosevia-gold" />
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="p-6 space-y-3">
                  <UploadCloud size={32} className="text-rosevia-rose mx-auto" />
                  <p className="text-xs font-semibold text-rosevia-clay">Upload facial photo</p>
                  <p className="text-[10px] text-rosevia-clay/70 leading-relaxed max-w-[200px]">
                    Ensure even natural lighting, clear camera lenses, and neutral facial expressions.
                  </p>
                </div>
              )}
            </div>

            {/* Simulated Calibration Text */}
            {scanning && (
              <div className="bg-rosevia-cream/80 border border-rosevia-rose/40 rounded-xl p-3 w-full text-center">
                <p className="text-xs font-bold text-rosevia-clay flex items-center justify-center animate-pulse">
                  <Activity size={12} className="mr-1.5 animate-spin" />
                  {scanStep === 1 && "Calibrating T-Zone Sebum Lipids..."}
                  {scanStep === 2 && "Auditing Cheek Vascular Redness..."}
                  {scanStep === 3 && "Extracting Stratum Corneum Hydration..."}
                </p>
              </div>
            )}

            {/* Quick Sample Selector */}
            {!scanning && !showReport && (
              <div className="w-full space-y-2">
                <p className="text-[10px] text-center tracking-wider font-semibold uppercase text-rosevia-clay/70">Or test with demo models</p>
                <div className="grid grid-cols-2 gap-2">
                  {sampleSelfies.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => selectSampleSelfie(s.url)}
                      className={`text-[10px] p-2 border rounded-xl bg-white/40 cursor-pointer hover:border-rosevia-gold transition-all truncate text-left flex items-center space-x-2 ${
                        image === s.url ? "border-rosevia-gold bg-rosevia-rose/20" : "border-rosevia-rose/20"
                      }`}
                    >
                      <img src={s.url} className="w-6 h-6 rounded-full object-cover shrink-0" />
                      <span className="truncate">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="w-full flex flex-col space-y-2 pt-2">
              <label className="w-full py-3.5 rounded-xl border border-dashed border-rosevia-rose bg-white hover:bg-rosevia-rose/10 transition-all text-xs tracking-widest font-semibold uppercase text-rosevia-clay text-center cursor-pointer block">
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
                  className="w-full py-4 rounded-xl bg-rosevia-clay text-rosevia-cream text-xs tracking-widest font-semibold uppercase hover:bg-rosevia-charcoal transition-all cursor-pointer flex items-center justify-center shadow-md"
                >
                  <Camera size={14} className="mr-2" /> Start AI Diagnostics
                </button>
              )}
            </div>
          </div>

          {/* Clinical Diagnostic Report Panel */}
          <div className="md:col-span-7 space-y-4">
            {showReport ? (
              <div className="space-y-4 animate-fade-in">
                
                {/* Score Header Card */}
                <div className="glass-card p-5 flex items-center gap-6">
                  {/* Glowing Radial Gauge */}
                  <div className="relative shrink-0 w-24 h-24 rounded-full bg-rosevia-cream border border-rosevia-rose/30 flex flex-col items-center justify-center shadow-md animate-pulse-ring">
                    <span className="text-3xl font-serif font-semibold text-rosevia-clay">84</span>
                    <span className="text-[9px] font-bold text-rosevia-clay/60 uppercase tracking-wide">Skin Index</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center space-x-1.5 bg-rosevia-green text-rosevia-sage px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-rosevia-sage/20">
                      <ShieldCheck size={10} /> <span>Barrier Stable</span>
                    </div>
                    <h3 className="text-base font-serif font-semibold text-rosevia-clay">Clinical Diagnosis</h3>
                    <p className="text-xs text-rosevia-clay/85 leading-relaxed">
                      Redness and texture show a **+3.4% improvement** compared to May 19. Pore sebum congestion has dropped by 8% due to active BHA toner adherence.
                    </p>
                  </div>
                </div>

                {/* Score Breakdown Slider Cards */}
                <div className="glass-card p-5 space-y-4">
                  <h4 className="text-xs font-semibold tracking-widest uppercase text-rosevia-clay">Metric Breakdowns</h4>
                  
                  <div className="space-y-3.5">
                    {[
                      { label: "Barrier Calmness (Redness)", score: 89, color: "bg-rosevia-sage" },
                      { label: "Epidermal Texture (Smoothness)", score: 81, color: "bg-rosevia-rose" },
                      { label: "Pore Congestion (Sebum Balance)", score: 78, color: "bg-rosevia-gold" },
                      { label: "Deep Cellular Hydration", score: 85, color: "bg-rosevia-clay" },
                      { label: "Elasticity (Fine Lines)", score: 92, color: "bg-rosevia-terracotta" }
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium text-rosevia-clay">
                          <span>{item.label}</span>
                          <span className="font-bold">{item.score}%</span>
                        </div>
                        <div className="w-full h-2 bg-rosevia-cream border border-rosevia-rose/25 rounded-full overflow-hidden">
                          <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.score}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Explanatory Diagnosis */}
                <div className="glass-card p-5 space-y-3">
                  <div className="flex items-center space-x-2">
                    <Sparkles size={16} className="text-rosevia-gold" />
                    <h4 className="text-xs font-semibold tracking-widest uppercase text-rosevia-clay">Derm AI Diagnostics</h4>
                  </div>
                  <p className="text-xs text-rosevia-clay/90 leading-relaxed space-y-2">
                    "Excellent progress, redness is significantly down! The Centella Asiatica serum added to your calm cycle is actively cooling vascular tissues. We notice deep cellular hydration has climbed to 85%, responding well to your water intake logs. 
                    <br /><br />
                    **Recommended Adjustment**: Since pores remain slightly congested at 78%, increase your **Salicylic Acid (BHA)** toner application strictly on Tuesdays and Fridays in your PM cycle. Layer under your moisturizer on completely dry skin to refine lipids without distressing the barrier."
                  </p>
                </div>

                {/* Before / After Progression Map */}
                <div className="glass-card p-5 space-y-3">
                  <h4 className="text-xs font-semibold tracking-widest uppercase text-rosevia-clay">Historical Progress Chart</h4>
                  <div className="flex justify-between items-center text-center bg-white/40 border border-rosevia-rose/20 rounded-2xl p-4">
                    <div>
                      <p className="text-[10px] tracking-wider uppercase text-rosevia-clay/65">Week 1 (May 5)</p>
                      <p className="text-sm font-bold text-rosevia-clay/70 mt-0.5">79 Index</p>
                    </div>
                    <TrendingUp size={16} className="text-rosevia-rose/50" />
                    <div>
                      <p className="text-[10px] tracking-wider uppercase text-rosevia-clay/65">Week 2 (May 12)</p>
                      <p className="text-sm font-bold text-rosevia-clay/70 mt-0.5">80 Index</p>
                    </div>
                    <TrendingUp size={16} className="text-rosevia-gold" />
                    <div>
                      <p className="text-[10px] tracking-wider uppercase text-rosevia-clay/65">Current (May 26)</p>
                      <p className="text-sm font-bold text-rosevia-clay mt-0.5">84 Index</p>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              /* Instructions Placeholder when not analyzed */
              <div className="glass-card p-8 text-center flex flex-col items-center justify-center space-y-4 aspect-[4/3] md:aspect-[4/2.8]">
                <div className="w-12 h-12 rounded-full bg-rosevia-rose/20 flex items-center justify-center">
                  <Camera size={22} className="text-rosevia-clay" />
                </div>
                <h3 className="text-base font-serif text-rosevia-clay">Provide a photo to activate diagnostics</h3>
                <p className="text-xs text-rosevia-clay/80 max-w-sm leading-relaxed">
                  Upload a clear facial selfie or select one of our pre-loaded biological skincare models. The AI will draw scan layers and compute deep index scores.
                </p>
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
          className="flex flex-col items-center text-rosevia-clay/70 hover:text-rosevia-clay shrink-0 cursor-pointer"
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
