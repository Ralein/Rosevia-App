"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  FolderHeart, 
  Layers, 
  Activity, 
  AlertCircle, 
  BookOpen, 
  Trash2, 
  AlertTriangle,
  Clock,
  Sparkles,
  CheckCircle,
  CalendarDays,
  Loader2,
  Settings
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: string;
  pao: string;
  expiryDate: string; 
  fluidLevel: number; 
  ingredients: string[];
}

export default function SmartCabinet() {
  const [cabinet, setCabinet] = useState<Product[]>([]);
  const [newProductName, setNewProductName] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scheduledStatus, setScheduledStatus] = useState<string | null>(null);
  
  const navigateTo = (path: string) => {
    window.location.href = path;
  };

  const defaultCabinet: Product[] = [];

  useEffect(() => {
    const savedCabinet = localStorage.getItem("rosevia_cabinet");
    if (savedCabinet) {
      setCabinet(JSON.parse(savedCabinet));
    } else {
      setCabinet(defaultCabinet);
      localStorage.setItem("rosevia_cabinet", JSON.stringify(defaultCabinet));
    }
  }, []);

  const saveCabinetToStorage = (updatedCabinet: Product[]) => {
    setCabinet(updatedCabinet);
    localStorage.setItem("rosevia_cabinet", JSON.stringify(updatedCabinet));
  };

  const handleScanProduct = async () => {
    if (!newProductName.trim()) return;
    setScanning(true);
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "scan",
          productName: newProductName
        })
      });
      const data = await response.json();
      
      if (data.product) {
        const today = new Date();
        today.setMonth(today.getMonth() + (data.product.expiryMonths || 12));
        const formattedExpiry = today.toISOString().split("T")[0];

        const scannedProduct: Product = {
          id: `prod-${Date.now()}`,
          name: data.product.name,
          category: data.product.category,
          pao: data.product.pao || "12M",
          expiryDate: formattedExpiry,
          fluidLevel: 100, 
          ingredients: data.product.ingredients || ["Water", "Glycerin"]
        };

        const updated = [scannedProduct, ...cabinet];
        saveCabinetToStorage(updated);
        setNewProductName("");
      }
    } catch (error) {
      console.error("Scanning failed, adding placeholder:", error);
    } finally {
      setScanning(false);
    }
  };

  const deleteProduct = (id: string) => {
    const updated = cabinet.filter((p) => p.id !== id);
    saveCabinetToStorage(updated);
  };

  const adjustFluidLevel = (id: string, amount: number) => {
    const updated = cabinet.map((p) => {
      if (p.id === id) {
        const nextLevel = Math.max(0, Math.min(100, p.fluidLevel + amount));
        return { ...p, fluidLevel: nextLevel };
      }
      return p;
    });
    saveCabinetToStorage(updated);
  };

  // AI Skincare Auto-Scheduler based on cosmetic ingredient chemistry
  const handleScheduleIntoRoutine = (product: Product) => {
    const savedRoutine = localStorage.getItem("rosevia_routine");
    if (!savedRoutine) return;
    
    const routineObj = JSON.parse(savedRoutine);
    const updatedWeeklyCycle = { ...routineObj.weeklyCycle };
    const name = product.name;
    const cat = product.category.toLowerCase();
    const ingText = product.ingredients.join(" ").toLowerCase();

    // Map scheduling strategically based on active chemical biology
    if (cat.includes("cleans")) {
      // Cleansers are the first step in both AM and PM
      for (const day of Object.keys(updatedWeeklyCycle)) {
        const cleanAm = updatedWeeklyCycle[day].am.filter((p: string) => !p.toLowerCase().includes("cleans"));
        updatedWeeklyCycle[day].am = [name, ...cleanAm];
        
        const cleanPm = updatedWeeklyCycle[day].pm.filter((p: string) => !p.toLowerCase().includes("cleans"));
        updatedWeeklyCycle[day].pm = [name, ...cleanPm];
      }
    } else if (cat.includes("spf") || cat.includes("sunscreen")) {
      // SPF broad-spectrum sunscreen is AM strictly, as the final lock step
      for (const day of Object.keys(updatedWeeklyCycle)) {
        const cleanAm = updatedWeeklyCycle[day].am.filter((p: string) => !p.toLowerCase().includes("spf") && !p.toLowerCase().includes("sunscreen"));
        updatedWeeklyCycle[day].am = [...cleanAm, name];
      }
    } else if (ingText.includes("retinol") || ingText.includes("retinoid") || ingText.includes("tretinoin")) {
      // Retinols strictly PM on alternate safe nights (Tuesday, Thursday, Saturday, Sunday)
      const pmRetinolDays = ["tuesday", "thursday", "saturday", "sunday"];
      for (const day of pmRetinolDays) {
        const cleanPm = updatedWeeklyCycle[day].pm.filter((p: string) => !p.toLowerCase().includes("retin") && !p.toLowerCase().includes("tretin"));
        const cleanserIdx = cleanPm.findIndex((p: string) => p.toLowerCase().includes("cleans"));
        cleanPm.splice(cleanserIdx + 1, 0, name);
        updatedWeeklyCycle[day].pm = cleanPm;
      }
    } else if (ingText.includes("ascorbic") || ingText.includes("vitamin c")) {
      // Vitamin C strictly AM for day cellular defense (Monday, Wednesday, Friday, Sunday)
      const amVitCDays = ["monday", "wednesday", "friday", "sunday"];
      for (const day of amVitCDays) {
        const cleanAm = updatedWeeklyCycle[day].am.filter((p: string) => !p.toLowerCase().includes("vit") && !p.toLowerCase().includes("ascorbic"));
        const cleanserIdx = cleanAm.findIndex((p: string) => p.toLowerCase().includes("cleans"));
        cleanAm.splice(cleanserIdx + 1, 0, name);
        updatedWeeklyCycle[day].am = cleanAm;
      }
    } else if (ingText.includes("salicylic") || ingText.includes("bha") || ingText.includes("glycolic") || ingText.includes("lactic") || ingText.includes("aha")) {
      // Exfoliating acids PM strictly on safe non-retinol nights (Monday, Wednesday, Friday)
      const pmAcidDays = ["monday", "wednesday", "friday"];
      for (const day of pmAcidDays) {
        const cleanPm = updatedWeeklyCycle[day].pm.filter((p: string) => !p.toLowerCase().includes("bha") && !p.toLowerCase().includes("aha") && !p.toLowerCase().includes("salicyl") && !p.toLowerCase().includes("glycol"));
        const cleanserIdx = cleanPm.findIndex((p: string) => p.toLowerCase().includes("cleans"));
        cleanPm.splice(cleanserIdx + 1, 0, name);
        updatedWeeklyCycle[day].pm = cleanPm;
      }
    } else if (cat.includes("moisturizer") || cat.includes("cream")) {
      // Moisturizers go to AM (before SPF) and PM (final seal step)
      for (const day of Object.keys(updatedWeeklyCycle)) {
        const cleanAm = updatedWeeklyCycle[day].am.filter((p: string) => !p.toLowerCase().includes("moist") && !p.toLowerCase().includes("cream"));
        const spfIdx = cleanAm.findIndex((p: string) => p.toLowerCase().includes("spf") || p.toLowerCase().includes("sunscreen"));
        if (spfIdx !== -1) {
          cleanAm.splice(spfIdx, 0, name);
        } else {
          cleanAm.push(name);
        }
        updatedWeeklyCycle[day].am = cleanAm;

        const cleanPm = updatedWeeklyCycle[day].pm.filter((p: string) => !p.toLowerCase().includes("moist") && !p.toLowerCase().includes("cream"));
        cleanPm.push(name);
        updatedWeeklyCycle[day].pm = cleanPm;
      }
    } else {
      // Fallback: general serums/toners go to AM and PM as hydrating middle steps
      for (const day of Object.keys(updatedWeeklyCycle)) {
        const cleanAm = [...updatedWeeklyCycle[day].am];
        cleanAm.push(name);
        updatedWeeklyCycle[day].am = cleanAm;

        const cleanPm = [...updatedWeeklyCycle[day].pm];
        cleanPm.push(name);
        updatedWeeklyCycle[day].pm = cleanPm;
      }
    }

    routineObj.weeklyCycle = updatedWeeklyCycle;
    localStorage.setItem("rosevia_routine", JSON.stringify(routineObj));
    
    setScheduledStatus(`"${name}" successfully scheduled by AI!`);
    setTimeout(() => setScheduledStatus(null), 3000);
  };

  const checkWarnings = () => {
    const warnings = [];
    const today = new Date();
    
    for (const p of cabinet) {
      const exp = new Date(p.expiryDate);
      const diffTime = exp.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 30 && diffDays > 0) {
        warnings.push({ type: "expiry", text: `"${p.name}" expires in ${diffDays} days! Order a replacement soon.` });
      } else if (diffDays <= 0) {
        warnings.push({ type: "expired", text: `"${p.name}" has expired! Avoid applying oxidized actives to your skin.` });
      }

      if (p.fluidLevel <= 20 && p.fluidLevel > 0) {
        warnings.push({ type: "low", text: `"${p.name}" is running low (${p.fluidLevel}% left). Reorder warning triggered.` });
      }
    }
    return warnings;
  };

  const cabinetWarnings = checkWarnings();

  // Helper component to render beautiful category-specific SVG skincare vials
  const RenderSkincareVial = ({ category, level }: { category: string; level: number }) => {
    const fillHeight = 36 - (36 * level) / 100; // SVG bound heights
    const fillPercent = level;

    // Determine color of fluid based on category
    let fluidColor = "#FAF7F2"; 
    if (category.toLowerCase().includes("toner")) fluidColor = "#D4AF37"; 
    if (category.toLowerCase().includes("serum")) fluidColor = "#688A7D"; 
    if (category.toLowerCase().includes("cleans")) fluidColor = "#93A39A"; 
    if (category.toLowerCase().includes("moist") || category.toLowerCase().includes("cream")) fluidColor = "#C5A880";

    if (category.toLowerCase().includes("serum")) {
      // 1. TALL AMBER DROPPER VIAL (SERUM)
      return (
        <svg className="w-12 h-20 text-rosevia-clay shrink-0 drop-shadow-sm" viewBox="0 0 40 70" fill="none">
          {/* Dropper Cap */}
          <rect x="17" y="2" width="6" height="8" rx="1" fill="#060D0B" />
          <rect x="14" y="10" width="12" height="6" fill="#D4AF37" />
          {/* Bottle Neck */}
          <rect x="16" y="16" width="8" height="6" fill="#D4AF37" opacity="0.3" />
          {/* Bottle Body */}
          <path d="M8,22 C8,22 8,22 8,22 C8,22 32,22 32,22 C32,22 32,22 32,22 L32,60 C32,63 29,66 26,66 L14,66 C11,66 8,63 8,60 Z" fill="rgba(212, 175, 55, 0.08)" stroke="#D4AF37" strokeWidth="1.5" />
          {/* Internal Fluid Level (Clipped) */}
          <g clipPath="url(#bodyClipSerum)">
            <rect x="9" y={23 + fillHeight} width="22" height="42" fill={fluidColor} opacity="0.65" />
          </g>
          <clipPath id="bodyClipSerum">
            <path d="M9,23 L31,23 L31,59 C31,61 29,64 26,64 L14,64 C11,64 9,61 9,59 Z" />
          </clipPath>
          {/* Dropper Pipette Line inside */}
          <line x1="20" y1="18" x2="20" y2="55" stroke="#D4AF37" strokeWidth="1.2" strokeDasharray="2 2" />
        </svg>
      );
    } else if (category.toLowerCase().includes("moisturizer") || category.toLowerCase().includes("spf") || category.toLowerCase().includes("cream")) {
      // 2. LUXURY WIDE JAR (CREAM/MOISTURIZER)
      return (
        <svg className="w-16 h-16 text-rosevia-clay shrink-0 drop-shadow-sm" viewBox="0 0 50 50" fill="none">
          {/* Flat Lid */}
          <rect x="8" y="4" width="34" height="6" rx="1.5" fill="#060D0B" />
          <rect x="10" y="10" width="30" height="2" fill="#D4AF37" />
          {/* Jar Body */}
          <path d="M4,13 C4,13 46,13 46,13 L43,41 C43,44 40,46 37,46 L13,46 C10,46 7,44 7,41 Z" fill="rgba(212, 175, 55, 0.08)" stroke="#D4AF37" strokeWidth="1.5" />
          {/* Internal Fluid Level (Clipped) */}
          <g clipPath="url(#bodyClipCream)">
            <rect x="5" y={14 + (28 - (28 * fillPercent) / 100)} width="40" height="30" fill={fluidColor} opacity="0.65" />
          </g>
          <clipPath id="bodyClipCream">
            <path d="M5,14 L45,14 L42,40 C42,42 40,44 37,44 L13,44 C10,44 8,42 8,40 Z" />
          </clipPath>
        </svg>
      );
    } else {
      // 3. SLEEK CLINICAL CYLINDER BOTTLE (TONER / CLEANSER)
      return (
        <svg className="w-12 h-20 text-rosevia-clay shrink-0 drop-shadow-sm" viewBox="0 0 34 70" fill="none">
          {/* Cylinder Cap */}
          <rect x="11" y="2" width="12" height="12" rx="1" fill="#060D0B" />
          {/* Bottle Body */}
          <rect x="6" y="15" width="22" height="50" rx="3" fill="rgba(212, 175, 55, 0.08)" stroke="#D4AF37" strokeWidth="1.5" />
          {/* Internal Fluid Level */}
          <g clipPath="url(#bodyClipCylinder)">
            <rect x="7" y={16 + (48 - (48 * fillPercent) / 100)} width="20" height="48" fill={fluidColor} opacity="0.65" />
          </g>
          <clipPath id="bodyClipCylinder">
            <rect x="7" y="16" width="20" height="48" rx="2" />
          </clipPath>
        </svg>
      );
    }
  };

  return (
    <div className="min-h-screen bg-rosevia-cream text-rosevia-charcoal pb-28 select-none">
      
      <div className="max-w-4xl mx-auto px-4 pt-6 md:pt-10 flex flex-col space-y-6 animate-fade-in">
        
        {/* Header Title */}
        <header className="flex justify-between items-start">
          <div>
            <h1 className="text-xs tracking-widest font-bold text-rosevia-clay uppercase">Cosmeceutical Library</h1>
            <p className="text-2xl md:text-3xl font-serif text-rosevia-charcoal tracking-tight font-light mt-1">
              Digital Cabinet & <span className="italic text-rosevia-gold font-normal">Shelf Scanner</span>
            </p>
          </div>
          
          {/* Clinical Profile Circle Initials return to Home */}
          <button 
            onClick={() => navigateTo("/")}
            className="w-10 h-10 rounded-full bg-gradient-to-tr from-rosevia-gold/30 to-rosevia-rose/30 border border-rosevia-gold/50 flex items-center justify-center font-serif text-xs font-bold text-rosevia-gold hover:shadow-[0_0_12px_rgba(212,175,55,0.3)] transition-all shrink-0 cursor-pointer"
          >
            RN
          </button>
        </header>

        {/* Action scheduling banner status alerts */}
        {scheduledStatus && (
          <div className="bg-rosevia-green border border-rosevia-sage/40 text-rosevia-sage p-4 rounded-xl flex items-center gap-2 text-xs font-bold shadow animate-fade-in">
            <CheckCircle size={14} className="stroke-[3]" />
            <span>{scheduledStatus}</span>
          </div>
        )}

        {/* Warning Alerts Banner */}
        {cabinetWarnings.length > 0 && (
          <div className="space-y-2">
            {cabinetWarnings.map((w, idx) => (
              <div 
                key={idx} 
                className={`flex items-start p-3.5 rounded-xl border text-xs leading-relaxed shadow-xs ${
                  w.type === "expired" 
                    ? "bg-rose-950/20 border-rose-900/35 text-rose-300"
                    : w.type === "expiry"
                    ? "bg-amber-950/20 border-amber-900/35 text-amber-300"
                    : "bg-orange-950/20 border-orange-900/35 text-orange-300"
                }`}
              >
                <AlertTriangle size={14} className="mr-2 shrink-0 mt-0.5 text-rosevia-gold" />
                <span className="font-semibold">{w.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* Shelf Scanner Simulator Input */}
        <div className="glass-card p-6 space-y-4 shadow-sm">
          <div className="flex items-center space-x-2">
            <Sparkles size={16} className="text-rosevia-gold animate-pulse" />
            <h3 className="text-xs font-semibold tracking-widest uppercase text-rosevia-clay">Shelf Scanner Simulator</h3>
          </div>
          <p className="text-xs text-rosevia-clay/70 leading-relaxed font-medium">
            Type any brand product (e.g. <i>"Paula's Choice BHA"</i> or <i>"CeraVe Hydrating Cleanser"</i>) to simulate photo scanner extraction. Our AI extracts branded naming and full active ingredients.
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={newProductName}
              onChange={(e) => setNewProductName(e.target.value)}
              placeholder="Enter product brand name to scan..."
              disabled={scanning}
              className="flex-1 bg-rosevia-sand border border-rosevia-rose/30 rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-rosevia-gold focus:outline-none disabled:opacity-50 text-rosevia-charcoal font-medium placeholder-rosevia-clay/40"
            />
            <button
              onClick={handleScanProduct}
              disabled={scanning || !newProductName.trim()}
              className="px-6 rounded-xl bg-rosevia-gold text-rosevia-cream text-xs font-bold tracking-wider uppercase hover:bg-rosevia-rose transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center shrink-0 shadow-sm"
            >
              {scanning ? <Loader2 size={14} className="animate-spin" /> : "Scan Item"}
            </button>
          </div>
        </div>

        {/* Tiered Polished Malachite & Gold Skincare Shelf View */}
        <div className="space-y-8 bg-gradient-to-b from-[#111C18] to-[#070D0A] border border-[#162B22] rounded-3xl p-6 relative overflow-hidden shadow-md">
          {/* Glass Gloss/Glare Accent */}
          <div className="absolute top-0 right-0 w-[50%] h-[150%] bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none transform rotate-12" />

          {["Cleanser", "Toner", "Serum", "Moisturizer"].map((cat) => {
            const items = cabinet.filter((p) => p.category === cat || (cat === "Moisturizer" && p.category === "SPF"));
            
            return (
              <div key={cat} className="space-y-4 relative">
                <div className="flex justify-between items-center border-b border-rosevia-rose/25 pb-1">
                  <h4 className="text-[10px] tracking-widest font-bold uppercase text-rosevia-gold">{cat}s & Barriers</h4>
                  <span className="text-[9px] font-bold text-rosevia-clay uppercase">{items.length} Bottle{items.length !== 1 && "s"}</span>
                </div>

                {items.length === 0 ? (
                  <p className="text-[10px] text-rosevia-clay/60 italic py-2 pl-2">No {cat.toLowerCase()}s on this shelf tier.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-2">
                    {items.map((prod) => (
                      <div 
                        key={prod.id} 
                        className="glass-card bg-rosevia-sand/85 p-4 rounded-xl relative flex flex-col justify-between space-y-3 group border border-rosevia-rose/30 shadow-sm transition-all duration-300 hover:border-rosevia-gold/50"
                      >
                        {/* Expiry Badge */}
                        <div className="absolute top-3 right-3 flex items-center space-x-1 text-[8px] font-bold bg-rosevia-cream border border-rosevia-rose/40 px-1.5 py-0.5 rounded text-rosevia-gold">
                          <Clock size={8} /> <span>{prod.pao} PAO</span>
                        </div>

                        {/* Top layout: Custom SVG Silhouetted skincare bottle + Metadata */}
                        <div className="flex items-center space-x-3">
                          <RenderSkincareVial category={prod.category} level={prod.fluidLevel} />
                          <div className="flex-1 min-w-0">
                            <h5 className="text-[11px] font-bold text-rosevia-charcoal leading-tight pr-6 truncate">
                              {prod.name}
                            </h5>
                            <span className="text-[8px] text-rosevia-gold block mt-1 uppercase font-bold tracking-wider">
                              {prod.category}
                            </span>
                          </div>
                        </div>

                        {/* Ingredients Tags */}
                        <div className="flex flex-wrap gap-1">
                          {prod.ingredients.slice(0, 3).map((ing, i) => (
                            <span key={i} className="text-[8px] bg-rosevia-cream border border-rosevia-rose/25 text-rosevia-clay px-1.5 py-0.2 rounded font-medium">
                              {ing}
                            </span>
                          ))}
                          {prod.ingredients.length > 3 && (
                            <span className="text-[8px] text-rosevia-gold font-bold self-center ml-0.5">+{prod.ingredients.length - 3}</span>
                          )}
                        </div>

                        {/* Fluid visual progress bar and controls */}
                        <div className="space-y-1.5 border-t border-rosevia-rose/15 pt-2">
                          <div className="flex justify-between items-center text-[9px] font-bold text-rosevia-clay">
                            <span>Remaining Capacity</span>
                            <span className={prod.fluidLevel <= 20 ? "text-rosevia-terracotta" : ""}>{prod.fluidLevel}%</span>
                          </div>
                          
                          {/* Progress Line */}
                          <div className="w-full h-1.5 bg-rosevia-cream border border-rosevia-rose/20 rounded-full overflow-hidden shadow-inner">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${
                                prod.fluidLevel <= 20 ? "bg-rosevia-terracotta" : "bg-rosevia-gold"
                              }`} 
                              style={{ width: `${prod.fluidLevel}%` }} 
                            />
                          </div>

                          {/* Fluid Level Buttons & Auto-Scheduler */}
                          <div className="flex justify-between items-center pt-1.5">
                            <div className="flex space-x-1 bg-rosevia-cream p-0.5 rounded-md border border-rosevia-rose/25">
                              <button 
                                onClick={() => adjustFluidLevel(prod.id, -10)}
                                className="w-5 h-5 rounded border border-rosevia-rose/20 text-[9px] font-bold flex items-center justify-center bg-rosevia-sand cursor-pointer hover:bg-rosevia-gold/20 transition-all shadow-xs text-rosevia-clay hover:text-rosevia-gold"
                              >
                                -
                              </button>
                              <button 
                                onClick={() => adjustFluidLevel(prod.id, 10)}
                                className="w-5 h-5 rounded border border-rosevia-rose/20 text-[9px] font-bold flex items-center justify-center bg-rosevia-sand cursor-pointer hover:bg-rosevia-gold/20 transition-all shadow-xs text-rosevia-clay hover:text-rosevia-gold"
                              >
                                +
                              </button>
                            </div>

                            {/* Active AI Schedule Button */}
                            <button
                              onClick={() => handleScheduleIntoRoutine(prod)}
                              className="px-2 py-1 rounded bg-rosevia-gold/15 border border-rosevia-gold/30 hover:bg-rosevia-gold hover:text-rosevia-cream text-[8px] font-bold tracking-wider uppercase text-rosevia-gold transition-all duration-300 cursor-pointer flex items-center gap-1 shadow-xs"
                              title="Reschedule active weekly cycle using AI cosmetology scheduling"
                            >
                              <CalendarDays size={9} /> Schedule
                            </button>

                            <button 
                              onClick={() => deleteProduct(prod.id)}
                              className="text-rosevia-clay hover:text-rosevia-terracotta transition-all cursor-pointer p-1"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                )}

                {/* PHYSICAL LUXURY LIQUID MALACHITE JADE GLASS AND GOLD TRIM SHELF FOOTING */}
                <div className="relative h-3.5 w-full rounded-t-sm shadow-md border-t border-rosevia-gold/40 bg-gradient-to-b from-rosevia-gold/25 to-rosevia-rose/10">
                  <div className="absolute bottom-0 w-full h-[3px] bg-rosevia-gold/40 shadow-inner" />
                </div>
              </div>
            );
          })}
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
          className="flex flex-col items-center text-rosevia-gold shrink-0 cursor-pointer"
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
          className="flex flex-col items-center text-rosevia-clay hover:text-rosevia-gold shrink-0 cursor-pointer animate-none"
        >
          <Settings size={18} />
          <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">Settings</span>
        </button>
      </nav>

    </div>
  );
}
