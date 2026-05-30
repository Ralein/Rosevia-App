"use client";

import { useState, useEffect } from "react";
import { 
  AlertCircle, 
  Layers, 
  Activity, 
  FolderHeart, 
  BookOpen,
  CheckCircle,
  Clock,
  ShieldCheck,
  AlertTriangle, 
  RotateCcw, 
  Loader2, 
  Settings,
  Calendar
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  name: string;
  category: string;
  ingredients: string[];
}

interface ConflictResult {
  actives: string[];
  severity: "high" | "medium" | "low";
  badge: string;
  title: string;
  description: string;
  solution: string;
}

const getInitials = (name?: string) => {
  if (!name) return "US";
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
};

export default function ConflictChecker() {
  const [cabinet, setCabinet] = useState<Product[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [manualIngredients, setManualIngredients] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<ConflictResult[] | null>(null);
  const [theme, setTheme] = useState("Midnight Jade");
  const [profileName, setProfileName] = useState("");

  const router = useRouter();

  const navigateTo = (path: string) => {
    router.push(path);
  };

  useEffect(() => {
    const savedCabinet = localStorage.getItem("rosevia_cabinet");
    if (savedCabinet) {
      setCabinet(JSON.parse(savedCabinet));
    }

    const savedTheme = localStorage.getItem("rosevia_theme");
    if (savedTheme) {
      setTheme(savedTheme);
    }

    const savedProfile = localStorage.getItem("rosevia_profile");
    if (savedProfile) {
      try {
        const p = JSON.parse(savedProfile);
        if (p.name) setProfileName(p.name);
      } catch (e) {}
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

  const handleProductToggle = (id: string) => {
    if (selectedProductIds.includes(id)) {
      setSelectedProductIds(selectedProductIds.filter((pId) => pId !== id));
    } else {
      setSelectedProductIds([...selectedProductIds, id]);
    }
    setResults(null); 
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setResults(null);

    let ingredientsList: string[] = [];
    
    const selectedProducts = cabinet.filter((p) => selectedProductIds.includes(p.id));
    for (const p of selectedProducts) {
      ingredientsList = [...ingredientsList, ...p.ingredients];
    }

    if (manualIngredients.trim()) {
      const splitManual = manualIngredients.split(",").map(i => i.trim()).filter(Boolean);
      ingredientsList = [...ingredientsList, ...splitManual];
    }

    ingredientsList = Array.from(new Set(ingredientsList));

    if (ingredientsList.length === 0) {
      setAnalyzing(false);
      return;
    }

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "conflict",
          ingredients: ingredientsList
        })
      });
      const data = await response.json();
      setResults(data.conflicts || []);
    } catch (error) {
      console.error("Conflict analysis failed:", error);
      setResults([]);
    } finally {
      setAnalyzing(false);
    }
  };

  const resetChecker = () => {
    setSelectedProductIds([]);
    setManualIngredients("");
    setResults(null);
  };

  return (
    <div className={`min-h-screen ${currentTheme.bg} pb-28 select-none transition-colors duration-500`}>
      
      <div className="max-w-4xl mx-auto px-4 pt-6 md:pt-10 flex flex-col space-y-6 animate-fade-in">
        
        {/* Header Title */}
        <header className="flex justify-between items-start">
          <div>
            <h1 className={`text-xs tracking-widest font-bold ${currentTheme.accent} uppercase`}>Cosmetic Chemistry Audit</h1>
            <p className="text-2xl md:text-3xl font-serif tracking-tight font-light mt-1">
              Ingredient <span className={`italic ${currentTheme.gold} font-normal`}>Conflict Checker</span>
            </p>
          </div>
          
          <button 
            onClick={() => navigateTo("/")}
            className={`w-10 h-10 rounded-full bg-gradient-to-tr from-rosevia-gold/30 to-rosevia-rose/30 border border-rosevia-gold/50 flex items-center justify-center font-serif text-xs font-bold ${currentTheme.gold} hover:shadow-lg transition-all shrink-0 cursor-pointer`}
          >
            {getInitials(profileName)}
          </button>
        </header>

        {/* Dynamic Selector Split */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Controls Selector Column */}
          <div className="md:col-span-5 space-y-5">
            
            {/* Shelf Items List */}
            <div className={`${currentTheme.card} p-5 space-y-4 shadow-sm`}>
              <h3 className={`text-xs font-semibold tracking-widest uppercase ${currentTheme.accent}`}>Select products from cabinet</h3>
              
              {cabinet.length === 0 ? (
                <div className="text-center py-5 border border-dashed border-rosevia-rose/30 rounded-2xl bg-rosevia-cream/30">
                  <p className={`text-[10px] ${currentTheme.accent} opacity-60 italic font-semibold`}>Your cabinet shelf is empty.</p>
                  <button 
                    onClick={() => navigateTo("/cabinet")}
                    className={`text-[10px] font-bold ${currentTheme.gold} hover:underline mt-1.5 block w-full text-center cursor-pointer`}
                  >
                    Go scan products first →
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {cabinet.map((prod) => {
                    const isSelected = selectedProductIds.includes(prod.id);
                    return (
                      <button
                        key={prod.id}
                        onClick={() => handleProductToggle(prod.id)}
                        className={`w-full flex items-center justify-between text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                          isSelected 
                            ? "bg-rosevia-rose/20 border-rosevia-gold shadow-xs"
                            : "bg-rosevia-cream/80 border-rosevia-rose/20 hover:border-rosevia-rose/50"
                        }`}
                      >
                        <div className="truncate pr-4">
                          <p className="font-semibold text-rosevia-charcoal truncate">{prod.name}</p>
                          <p className="text-[9px] text-rosevia-clay/65 mt-0.5 uppercase tracking-wider font-semibold">{prod.category}</p>
                        </div>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          isSelected ? "bg-rosevia-gold border-rosevia-gold text-rosevia-cream shadow-xs" : "border-rosevia-rose/50 bg-rosevia-cream"
                        }`}>
                          {isSelected && <CheckCircle size={10} className="stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Manual Ingredients Box */}
            <div className={`${currentTheme.card} p-5 space-y-3 shadow-sm`}>
              <h3 className={`text-xs font-semibold tracking-widest uppercase ${currentTheme.accent}`}>Or paste raw active ingredients</h3>
              <textarea
                value={manualIngredients}
                onChange={(e) => {
                  setManualIngredients(e.target.value);
                  setResults(null);
                }}
                placeholder="Niacinamide, Retinol, Vitamin C, Salicylic Acid..."
                className="w-full h-24 bg-rosevia-sand border border-rosevia-rose/30 rounded-xl p-3 text-xs focus:ring-1 focus:ring-rosevia-gold focus:outline-none placeholder-rosevia-clay/40 resize-none font-semibold text-rosevia-charcoal shadow-inner"
              />
              <p className={`text-[9px] ${currentTheme.accent} opacity-60 leading-relaxed font-semibold`}>
                Separate compounds with commas. We will automatically combine these with your checked shelf items.
              </p>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <button
                onClick={resetChecker}
                className="py-3.5 px-4 rounded-xl border border-rosevia-rose bg-rosevia-cream hover:bg-rosevia-rose/10 transition-all text-xs tracking-wider uppercase font-bold text-rosevia-clay shrink-0 cursor-pointer flex items-center shadow-xs"
              >
                <RotateCcw size={13} className="mr-1" /> Reset
              </button>
              <button
                onClick={handleAnalyze}
                disabled={analyzing || (selectedProductIds.length === 0 && !manualIngredients.trim())}
                className={`flex-1 py-3.5 rounded-xl text-rosevia-cream text-xs tracking-widest font-bold uppercase transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center shadow-md transform hover:-translate-y-0.5 ${currentTheme.button}`}
              >
                {analyzing ? "Analyzing interactions..." : "Analyze Safety Layering"}
              </button>
            </div>

          </div>

          {/* Audit Results Dashboard */}
          <div className="md:col-span-7">
            {analyzing ? (
              <div className={`${currentTheme.card} p-8 text-center flex flex-col items-center justify-center space-y-4 aspect-[4/3] md:aspect-[4/2.5] animate-pulse`}>
                <div className="w-12 h-12 rounded-full bg-rosevia-rose/25 flex items-center justify-center animate-pulse-ring">
                  <Loader2 size={22} className={`${currentTheme.gold} animate-spin`} />
                </div>
                <h3 className={`text-sm font-serif ${currentTheme.gold} font-bold uppercase tracking-wider`}>Cosmetic Chemist Auditing...</h3>
                <p className={`text-xs ${currentTheme.accent} opacity-70 max-w-xs leading-relaxed font-semibold`}>
                  Validating chemical layering bounds, matching molecular oxidation rates, and inspecting lipid barriers.
                </p>
              </div>
            ) : results ? (
              results.length === 0 ? (
                /* 100% BARRIER APPROVED STATUS */
                <div className={`${currentTheme.card} p-8 text-center flex flex-col items-center justify-center space-y-4 aspect-[4/3] md:aspect-[4/2.5] border border-rosevia-sage/40 bg-rosevia-green/45 shadow-sm animate-fade-in`}>
                  <div className="w-14 h-14 rounded-full bg-rosevia-cream flex items-center justify-center shadow-md border border-rosevia-sage/30">
                    <ShieldCheck size={28} className="text-rosevia-sage fill-rosevia-green/30" />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold bg-rosevia-cream text-rosevia-sage px-2.5 py-0.5 border border-rosevia-sage/20 rounded-full uppercase tracking-wider">
                      Barrier Approved
                    </span>
                    <h3 className="text-base font-serif text-rosevia-sage font-bold">100% Layering Compatibility</h3>
                  </div>
                  <p className="text-xs text-rosevia-clay/90 max-w-sm leading-relaxed font-medium">
                    Zero chemical conflicts or barrier-destroying combinations were found in this layout! Your active ingredients complement each other beautifully. Tap "Home" to log your routine.
                  </p>
                </div>
              ) : (
                /* CONFLICTS / SYNERGIES GENERATED LIST */
                <div className="space-y-4 animate-fade-in">
                  <h4 className={`text-xs font-bold tracking-widest uppercase ${currentTheme.accent}`}>Interaction Log ({results.length})</h4>
                  
                  {results.map((r, idx) => (
                    <div 
                      key={idx} 
                      className={`glass-card p-5 border flex flex-col space-y-3.5 shadow-sm ${
                        r.severity === "high" 
                          ? "border-rose-950 bg-rose-950/20"
                          : r.severity === "medium"
                          ? "border-amber-950 bg-amber-950/15"
                          : "border-rosevia-sage/35 bg-rosevia-green/20"
                      }`}
                    >
                      {/* Badge and Title */}
                      <div className="flex justify-between items-start">
                        <div>
                          <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase border tracking-wider inline-block ${
                            r.severity === "high" 
                              ? "bg-rose-900 border-rose-800 text-rose-200"
                              : r.severity === "medium"
                              ? "bg-amber-900 border-amber-800 text-amber-200"
                              : "bg-rosevia-green border-rosevia-sage/20 text-rosevia-sage"
                          }`}>
                            {r.badge}
                          </span>
                          <h5 className="text-sm font-bold text-rosevia-charcoal mt-2 pr-6 leading-tight">
                            {r.title}
                          </h5>
                        </div>
                        <AlertTriangle size={16} className={`shrink-0 ${
                          r.severity === "high" ? "text-rose-400 animate-bounce" : r.severity === "medium" ? "text-amber-400" : "text-rosevia-sage"
                        }`} />
                      </div>

                      {/* Chemical explanation */}
                      <p className="text-xs text-rosevia-clay/90 leading-relaxed font-semibold">
                        {r.description}
                      </p>

                      {/* Scientific Solution Card */}
                      <div className="bg-rosevia-cream border border-rosevia-rose/25 rounded-xl p-3.5 space-y-1.5 shadow-xs">
                        <p className="text-[9px] font-bold text-rosevia-gold flex items-center uppercase tracking-wider">
                          <Clock size={11} className="mr-1.5 shrink-0" /> Clinical Action Plan
                        </p>
                        <p className="text-xs text-rosevia-clay/90 leading-relaxed font-semibold">
                          {r.solution}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              /* GORGEOUS SVG MOLECULAR NETWORKS PLACEHOLDER */
              <div className={`${currentTheme.card} p-8 text-center flex flex-col items-center justify-center space-y-4 aspect-[4/3] md:aspect-[4/2.5] shadow-sm relative overflow-hidden group`}>
                <div className="absolute inset-0 bg-radial-gradient from-rosevia-rose/5 to-transparent pointer-events-none" />
                
                <svg className={`w-28 h-28 ${currentTheme.gold} animate-pulse`} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <circle cx="50" cy="50" r="6" strokeWidth="1.8" fill="#FAF7F2" />
                  <circle cx="30" cy="30" r="4" fill="#FAF7F2" />
                  <circle cx="70" cy="30" r="4" fill="#FAF7F2" />
                  <circle cx="30" cy="70" r="4" fill="#FAF7F2" />
                  <circle cx="70" cy="70" r="4" fill="#FAF7F2" />
                  <line x1="50" y1="50" x2="30" y2="30" strokeWidth="1.2" />
                  <line x1="50" y1="50" x2="70" y2="30" strokeWidth="1.2" />
                  <line x1="50" y1="50" x2="30" y2="70" strokeWidth="1.2" />
                  <line x1="50" y1="50" x2="70" y2="70" strokeWidth="1.2" />
                  <circle cx="50" cy="50" r="36" strokeDasharray="4 4" strokeOpacity="0.4" />
                </svg>

                <div className="space-y-1 z-10">
                  <h3 className={`text-sm font-serif font-bold ${currentTheme.gold} uppercase tracking-wide`}>Select items to scan safety</h3>
                  <p className={`text-xs ${currentTheme.accent} opacity-80 max-w-sm leading-relaxed font-semibold mx-auto`}>
                    Check off products from your digital cabinet on the left, or paste raw active ingredients (like Retinol or Salicylic Acid) to check for barrier deactivations and schedule alterations.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-lg glass-panel py-3 px-4 rounded-2xl flex justify-between items-center shadow-lg border border-rosevia-rose/40 z-50">
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
          className="flex flex-col items-center text-rosevia-gold shrink-0 cursor-pointer"
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
          className="flex flex-col items-center text-rosevia-clay hover:text-rosevia-gold shrink-0 cursor-pointer"
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
