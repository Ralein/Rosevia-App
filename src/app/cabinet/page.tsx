"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  FolderHeart, 
  Layers, 
  Activity, 
  AlertCircle, 
  MessageSquareHeart, 
  BookOpen, 
  Trash2, 
  AlertTriangle,
  Clock,
  Sparkles,
  CheckCircle,
  Users,
  Loader2
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
    let fluidColor = "#EAD2C6"; // Warm Rose blush
    if (category.toLowerCase().includes("toner")) fluidColor = "#C5A880"; // Sand Gold
    if (category.toLowerCase().includes("serum")) fluidColor = "#8C6D58"; // Clay Bronze
    if (category.toLowerCase().includes("cleans")) fluidColor = "#E8F0E6"; // Sage Calming

    if (category.toLowerCase().includes("serum")) {
      // 1. TALL AMBER DROPPER VIAL (SERUM)
      return (
        <svg className="w-12 h-20 text-rosevia-clay shrink-0 drop-shadow-sm" viewBox="0 0 40 70" fill="none">
          {/* Dropper Cap */}
          <rect x="17" y="2" width="6" height="8" rx="1" fill="#262423" />
          <rect x="14" y="10" width="12" height="6" fill="#C5A880" />
          {/* Bottle Neck */}
          <rect x="16" y="16" width="8" height="6" fill="#D4AF37" opacity="0.3" />
          {/* Bottle Body */}
          <path d="M8,22 C8,22 8,22 8,22 C8,22 32,22 32,22 C32,22 32,22 32,22 L32,60 C32,63 29,66 26,66 L14,66 C11,66 8,63 8,60 Z" fill="rgba(197, 168, 128, 0.15)" stroke="#C5A880" strokeWidth="1.5" />
          {/* Internal Fluid Level (Clipped) */}
          <g clipPath="url(#bodyClipSerum)">
            <rect x="9" y={23 + fillHeight} width="22" height="42" fill={fluidColor} opacity="0.65" />
          </g>
          <clipPath id="bodyClipSerum">
            <path d="M9,23 L31,23 L31,59 C31,61 29,64 26,64 L14,64 C11,64 9,61 9,59 Z" />
          </clipPath>
          {/* Dropper Pipette Line inside */}
          <line x1="20" y1="18" x2="20" y2="55" stroke="#C5A880" strokeWidth="1.2" strokeDasharray="2 2" />
        </svg>
      );
    } else if (category.toLowerCase().includes("moisturizer") || category.toLowerCase().includes("spf") || category.toLowerCase().includes("cream")) {
      // 2. LUXURY WIDE JAR (CREAM/MOISTURIZER)
      return (
        <svg className="w-16 h-16 text-rosevia-clay shrink-0 drop-shadow-sm" viewBox="0 0 50 50" fill="none">
          {/* Flat Lid */}
          <rect x="8" y="4" width="34" height="6" rx="1.5" fill="#262423" />
          <rect x="10" y="10" width="30" height="2" fill="#C5A880" />
          {/* Jar Body */}
          <path d="M4,13 C4,13 46,13 46,13 L43,41 C43,44 40,46 37,46 L13,46 C10,46 7,44 7,41 Z" fill="rgba(234, 210, 198, 0.15)" stroke="#C5A880" strokeWidth="1.5" />
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
          <rect x="11" y="2" width="12" height="12" rx="1" fill="#262423" />
          {/* Bottle Body */}
          <rect x="6" y="15" width="22" height="50" rx="3" fill="rgba(197, 168, 128, 0.12)" stroke="#C5A880" strokeWidth="1.5" />
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
              Digital Cabinet & <span className="italic text-rosevia-clay font-normal">Shelf Scanner</span>
            </p>
          </div>
          <div className="px-3 py-1 bg-rosevia-clay/10 border border-rosevia-clay/20 rounded-full text-[10px] tracking-wider uppercase font-bold text-rosevia-clay">
            Cabinet Size: {cabinet.length}
          </div>
        </header>

        {/* Warning Alerts Banner */}
        {cabinetWarnings.length > 0 && (
          <div className="space-y-2">
            {cabinetWarnings.map((w, idx) => (
              <div 
                key={idx} 
                className={`flex items-start p-3.5 rounded-xl border text-xs leading-relaxed shadow-xs ${
                  w.type === "expired" 
                    ? "bg-rose-50 border-rose-200 text-rose-800"
                    : w.type === "expiry"
                    ? "bg-amber-50 border-amber-200 text-amber-800"
                    : "bg-orange-50 border-orange-200 text-orange-800"
                }`}
              >
                <AlertTriangle size={14} className="mr-2 shrink-0 mt-0.5" />
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
              className="flex-1 bg-white border border-rosevia-rose/30 rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-rosevia-gold focus:outline-none disabled:opacity-50 text-rosevia-charcoal font-medium placeholder-rosevia-clay/40"
            />
            <button
              onClick={handleScanProduct}
              disabled={scanning || !newProductName.trim()}
              className="px-6 rounded-xl bg-rosevia-clay text-rosevia-cream text-xs font-bold tracking-wider uppercase hover:bg-rosevia-charcoal transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center shrink-0 shadow-sm"
            >
              {scanning ? <Loader2 size={14} className="animate-spin" /> : "Scan Item"}
            </button>
          </div>
        </div>

        {/* Tiered Wooden Skincare Shelf View */}
        <div className="space-y-8 bg-gradient-to-b from-[#F2EFE9] to-[#E5DFD4] border border-[#D5CDBF] rounded-3xl p-6 relative overflow-hidden shadow-md">
          {/* Shelf Glare */}
          <div className="absolute top-0 right-0 w-[50%] h-[150%] bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none transform rotate-12" />

          {["Cleanser", "Toner", "Serum", "Moisturizer"].map((cat) => {
            const items = cabinet.filter((p) => p.category === cat || (cat === "Moisturizer" && p.category === "SPF"));
            
            return (
              <div key={cat} className="space-y-4 relative">
                <div className="flex justify-between items-center border-b border-[#C8BFA9] pb-1">
                  <h4 className="text-[10px] tracking-widest font-bold uppercase text-[#8B7F68]">{cat}s & Barriers</h4>
                  <span className="text-[9px] font-bold text-[#8B7F68]/70 uppercase">{items.length} Bottle{items.length !== 1 && "s"}</span>
                </div>

                {items.length === 0 ? (
                  <p className="text-[10px] text-[#8C6D58]/60 italic py-2 pl-2">No {cat.toLowerCase()}s on this shelf tier.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-2">
                    {items.map((prod) => (
                      <div 
                        key={prod.id} 
                        className="glass-card bg-white/80 p-4 rounded-xl relative flex flex-col justify-between space-y-3 group border border-rosevia-rose/30 shadow-sm transition-all duration-300"
                      >
                        {/* Expiry Badge */}
                        <div className="absolute top-3 right-3 flex items-center space-x-1 text-[8px] font-bold bg-rosevia-cream border border-rosevia-rose/40 px-1.5 py-0.5 rounded text-rosevia-clay/85">
                          <Clock size={8} /> <span>{prod.pao} PAO</span>
                        </div>

                        {/* Top layout: Custom SVG Silhouetted skincare bottle + Metadata */}
                        <div className="flex items-center space-x-3">
                          <RenderSkincareVial category={prod.category} level={prod.fluidLevel} />
                          <div className="flex-1 min-w-0">
                            <h5 className="text-[11px] font-bold text-rosevia-charcoal leading-tight pr-6 truncate">
                              {prod.name}
                            </h5>
                            <span className="text-[8px] text-rosevia-clay/60 block mt-1 uppercase font-bold tracking-wider">
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
                          <div className="flex justify-between items-center text-[9px] font-bold text-rosevia-clay/85">
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

                          {/* Fluid Level Buttons & Delete */}
                          <div className="flex justify-between items-center pt-1.5">
                            <div className="flex space-x-1 bg-rosevia-cream/55 p-0.5 rounded-md border border-rosevia-rose/25">
                              <button 
                                onClick={() => adjustFluidLevel(prod.id, -10)}
                                className="w-5 h-5 rounded border border-rosevia-rose/20 text-[9px] font-bold flex items-center justify-center bg-white cursor-pointer hover:bg-rosevia-rose/10 transition-all shadow-xs"
                              >
                                -
                              </button>
                              <button 
                                onClick={() => adjustFluidLevel(prod.id, 10)}
                                className="w-5 h-5 rounded border border-rosevia-rose/20 text-[9px] font-bold flex items-center justify-center bg-white cursor-pointer hover:bg-rosevia-rose/10 transition-all shadow-xs"
                              >
                                +
                              </button>
                            </div>
                            <button 
                              onClick={() => deleteProduct(prod.id)}
                              className="text-rosevia-clay/40 hover:text-rosevia-terracotta transition-all cursor-pointer p-1"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                )}

                {/* PHYSICAL LUXURY GLASS AND WOOD FINISH SHELF FOOTING */}
                <div className="relative h-3 w-full rounded-t-sm shadow-sm border-t border-white/60 bg-gradient-to-b from-white/30 to-[#8B7F68]/30">
                  <div className="absolute bottom-0 w-full h-[3px] bg-[#A89A82] shadow-inner" />
                </div>
              </div>
            );
          })}
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
          className="flex flex-col items-center text-rosevia-gold shrink-0 cursor-pointer"
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
