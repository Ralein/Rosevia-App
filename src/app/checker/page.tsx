"use client";

import { useState, useEffect } from "react";
import { 
  AlertCircle, 
  Layers, 
  Activity, 
  FolderHeart, 
  MessageSquareHeart, 
  BookOpen,
  CheckCircle,
  HelpCircle,
  Clock,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Loader2
} from "lucide-react";

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

export default function ConflictChecker() {
  const [cabinet, setCabinet] = useState<Product[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [manualIngredients, setManualIngredients] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<ConflictResult[] | null>(null);

  const navigateTo = (path: string) => {
    window.location.href = path;
  };

  useEffect(() => {
    const savedCabinet = localStorage.getItem("rosevia_cabinet");
    if (savedCabinet) {
      setCabinet(JSON.parse(savedCabinet));
    }
  }, []);

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
    <div className="min-h-screen bg-rosevia-cream text-rosevia-charcoal pb-28 select-none">
      
      <div className="max-w-4xl mx-auto px-4 pt-6 md:pt-10 flex flex-col space-y-6 animate-fade-in">
        
        {/* Header Title */}
        <header className="flex justify-between items-start">
          <div>
            <h1 className="text-xs tracking-widest font-bold text-rosevia-clay uppercase">Cosmetic Chemistry Audit</h1>
            <p className="text-2xl md:text-3xl font-serif text-rosevia-charcoal tracking-tight font-light mt-1">
              Ingredient <span className="italic text-rosevia-clay font-normal">Conflict Checker</span>
            </p>
          </div>
          <div className="px-3 py-1 bg-rosevia-terracotta/15 border border-rosevia-terracotta/30 rounded-full text-[10px] tracking-wider uppercase font-bold text-rosevia-terracotta">
            Cellular Safety
          </div>
        </header>

        {/* Dynamic Selector Split */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Controls Selector Column */}
          <div className="md:col-span-5 space-y-5">
            
            {/* Shelf Items List */}
            <div className="glass-card p-5 space-y-4 shadow-sm">
              <h3 className="text-xs font-semibold tracking-widest uppercase text-rosevia-clay">Select products from cabinet</h3>
              
              {cabinet.length === 0 ? (
                <div className="text-center py-5 border border-dashed border-rosevia-rose/30 rounded-2xl bg-white/20">
                  <p className="text-[10px] text-rosevia-clay/60 italic font-medium">Your cabinet shelf is empty.</p>
                  <button 
                    onClick={() => navigateTo("/cabinet")}
                    className="text-[10px] font-bold text-rosevia-gold hover:underline mt-1.5 block w-full text-center cursor-pointer"
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
                            ? "bg-rosevia-rose/25 border-rosevia-gold shadow-xs"
                            : "bg-white border-rosevia-rose/20 hover:border-rosevia-rose/50"
                        }`}
                      >
                        <div className="truncate pr-4">
                          <p className="font-semibold text-rosevia-charcoal truncate">{prod.name}</p>
                          <p className="text-[9px] text-rosevia-clay/65 mt-0.5 uppercase tracking-wider font-medium">{prod.category}</p>
                        </div>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          isSelected ? "bg-rosevia-gold border-rosevia-gold text-white shadow-xs" : "border-rosevia-rose/50 bg-white"
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
            <div className="glass-card p-5 space-y-3 shadow-sm">
              <h3 className="text-xs font-semibold tracking-widest uppercase text-rosevia-clay">Or paste raw active ingredients</h3>
              <textarea
                value={manualIngredients}
                onChange={(e) => {
                  setManualIngredients(e.target.value);
                  setResults(null);
                }}
                placeholder="Niacinamide, Retinol, Vitamin C, Salicylic Acid..."
                className="w-full h-24 bg-white border border-rosevia-rose/30 rounded-xl p-3 text-xs focus:ring-1 focus:ring-rosevia-gold focus:outline-none placeholder-rosevia-clay/40 resize-none font-medium text-rosevia-charcoal"
              />
              <p className="text-[9px] text-rosevia-clay/60 leading-relaxed font-medium">
                Separate compounds with commas. We will automatically combine these with your checked shelf items.
              </p>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <button
                onClick={resetChecker}
                className="py-3.5 px-4 rounded-xl border border-rosevia-rose bg-white hover:bg-rosevia-rose/10 transition-all text-xs tracking-wider uppercase font-bold text-rosevia-clay shrink-0 cursor-pointer flex items-center shadow-xs"
              >
                <RotateCcw size={13} className="mr-1" /> Reset
              </button>
              <button
                onClick={handleAnalyze}
                disabled={analyzing || (selectedProductIds.length === 0 && !manualIngredients.trim())}
                className="flex-1 py-3.5 rounded-xl bg-rosevia-clay text-rosevia-cream text-xs tracking-widest font-bold uppercase hover:bg-rosevia-charcoal transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center shadow-md transform hover:-translate-y-0.5"
              >
                {analyzing ? "Analyzing interactions..." : "Analyze Safety Layering"}
              </button>
            </div>

          </div>

          {/* Audit Results Dashboard */}
          <div className="md:col-span-7">
            {analyzing ? (
              <div className="glass-card p-8 text-center flex flex-col items-center justify-center space-y-4 aspect-[4/3] md:aspect-[4/2.5] animate-pulse">
                <div className="w-12 h-12 rounded-full bg-rosevia-rose/25 flex items-center justify-center animate-pulse-ring">
                  <Loader2 size={22} className="text-rosevia-gold animate-spin" />
                </div>
                <h3 className="text-sm font-serif text-rosevia-clay font-bold uppercase tracking-wider">Cosmetic Chemist Auditing...</h3>
                <p className="text-xs text-rosevia-clay/60 max-w-xs leading-relaxed font-medium">
                  Validating chemical layering bounds, matching molecular oxidation rates, and inspecting lipid barriers.
                </p>
              </div>
            ) : results ? (
              results.length === 0 ? (
                /* 100% BARRIER APPROVED STATUS */
                <div className="glass-card p-8 text-center flex flex-col items-center justify-center space-y-4 aspect-[4/3] md:aspect-[4/2.5] border border-rosevia-sage/40 bg-rosevia-green/45 shadow-sm animate-fade-in">
                  <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-md border border-rosevia-sage/30">
                    <ShieldCheck size={28} className="text-rosevia-sage fill-rosevia-green/30" />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold bg-white text-rosevia-sage px-2.5 py-0.5 border border-rosevia-sage/20 rounded-full uppercase tracking-wider">
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
                  <h4 className="text-xs font-bold tracking-widest uppercase text-rosevia-clay">Interaction Log ({results.length})</h4>
                  
                  {results.map((r, idx) => (
                    <div 
                      key={idx} 
                      className={`glass-card p-5 border flex flex-col space-y-3.5 shadow-sm ${
                        r.severity === "high" 
                          ? "border-rose-200 bg-rose-50/20"
                          : r.severity === "medium"
                          ? "border-amber-200 bg-amber-50/10"
                          : "border-rosevia-sage/35 bg-rosevia-green/10"
                      }`}
                    >
                      {/* Badge and Title */}
                      <div className="flex justify-between items-start">
                        <div>
                          <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase border tracking-wider inline-block ${
                            r.severity === "high" 
                              ? "bg-rose-100 border-rose-200 text-rose-800"
                              : r.severity === "medium"
                              ? "bg-amber-100 border-amber-200 text-amber-800"
                              : "bg-rosevia-green border-rosevia-sage/20 text-rosevia-sage"
                          }`}>
                            {r.badge}
                          </span>
                          <h5 className="text-sm font-bold text-rosevia-charcoal mt-2 pr-6 leading-tight">
                            {r.title}
                          </h5>
                        </div>
                        <AlertTriangle size={16} className={`shrink-0 ${
                          r.severity === "high" ? "text-rose-600 animate-bounce" : r.severity === "medium" ? "text-amber-600" : "text-rosevia-sage"
                        }`} />
                      </div>

                      {/* Chemical explanation */}
                      <p className="text-xs text-rosevia-clay/90 leading-relaxed font-medium">
                        {r.description}
                      </p>

                      {/* Scientific Solution Card */}
                      <div className="bg-white/80 border border-rosevia-rose/25 rounded-xl p-3.5 space-y-1.5 shadow-xs">
                        <p className="text-[9px] font-bold text-rosevia-gold flex items-center uppercase tracking-wider">
                          <Clock size={11} className="mr-1.5 shrink-0" /> Clinical Action Plan
                        </p>
                        <p className="text-xs text-rosevia-clay/90 leading-relaxed font-medium">
                          {r.solution}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              /* GORGEOUS SVG MOLECULAR NETWORKS PLACEHOLDER */
              <div className="glass-card p-8 text-center flex flex-col items-center justify-center space-y-4 aspect-[4/3] md:aspect-[4/2.5] bg-white/50 shadow-sm relative overflow-hidden group">
                <div className="absolute inset-0 bg-radial-gradient from-rosevia-rose/5 to-transparent pointer-events-none" />
                
                <svg className="w-28 h-28 text-rosevia-rose/65 animate-pulse" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2">
                  {/* Molecular nodes */}
                  <circle cx="50" cy="50" r="6" strokeWidth="1.8" fill="#FAF7F2" />
                  <circle cx="30" cy="30" r="4" fill="#FAF7F2" />
                  <circle cx="70" cy="30" r="4" fill="#FAF7F2" />
                  <circle cx="30" cy="70" r="4" fill="#FAF7F2" />
                  <circle cx="70" cy="70" r="4" fill="#FAF7F2" />
                  {/* Connecting bonds */}
                  <line x1="50" y1="50" x2="30" y2="30" strokeWidth="1.2" />
                  <line x1="50" y1="50" x2="70" y2="30" strokeWidth="1.2" />
                  <line x1="50" y1="50" x2="30" y2="70" strokeWidth="1.2" />
                  <line x1="50" y1="50" x2="70" y2="70" strokeWidth="1.2" />
                  {/* Surrounding orbit ring */}
                  <circle cx="50" cy="50" r="36" strokeDasharray="4 4" strokeOpacity="0.4" />
                </svg>

                <div className="space-y-1 z-10">
                  <h3 className="text-sm font-serif font-bold text-rosevia-clay uppercase tracking-wide">Select items to scan safety</h3>
                  <p className="text-xs text-rosevia-clay/80 max-w-sm leading-relaxed font-medium mx-auto">
                    Check off products from your digital cabinet on the left, or paste raw active ingredients (like Retinol or Salicylic Acid) to check for barrier deactivations and schedule alterations.
                  </p>
                </div>
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
          className="flex flex-col items-center text-rosevia-gold shrink-0 cursor-pointer"
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
      </nav>

    </div>
  );
}
