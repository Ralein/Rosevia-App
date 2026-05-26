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
  Droplet,
  CheckCircle,
  Users
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: string;
  pao: string;
  expiryDate: string; // YYYY-MM-DD
  fluidLevel: number; // 0 to 100
  ingredients: string[];
}

export default function SmartCabinet() {
  const [cabinet, setCabinet] = useState<Product[]>([]);
  const [newProductName, setNewProductName] = useState("");
  const [scanning, setScanning] = useState(false);
  
  const navigateTo = (path: string) => {
    window.location.href = path;
  };

  // Base starting cabinet for premium presentation
  const defaultCabinet: Product[] = [
    {
      id: "prod-1",
      name: "La Roche-Posay Toleriane Double Repair",
      category: "Moisturizer",
      pao: "12M",
      expiryDate: "2026-11-15",
      fluidLevel: 80,
      ingredients: ["Water", "Glycerin", "Ceramide NP", "Niacinamide", "Tocopherol"]
    },
    {
      id: "prod-2",
      name: "Paula's Choice 2% BHA Liquid Exfoliant",
      category: "Toner",
      pao: "12M",
      expiryDate: "2026-07-10",
      fluidLevel: 15, // Low stock!
      ingredients: ["Water", "Salicylic Acid", "Methylpropanediol", "Butylene Glycol", "Green Tea Leaf Extract"]
    },
    {
      id: "prod-3",
      name: "SkinCeuticals C E Ferulic Serum",
      category: "Serum",
      pao: "6M",
      expiryDate: "2026-06-15", // Expiring very soon!
      fluidLevel: 45,
      ingredients: ["Water", "Ethoxydiglycol", "L-Ascorbic Acid", "Glycerin", "Ferulic Acid", "Vitamin E"]
    }
  ];

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
        // Calculate dynamic expiration date based on current time
        const today = new Date();
        today.setMonth(today.getMonth() + (data.product.expiryMonths || 12));
        const formattedExpiry = today.toISOString().split("T")[0];

        const scannedProduct: Product = {
          id: `prod-${Date.now()}`,
          name: data.product.name,
          category: data.product.category,
          pao: data.product.pao || "12M",
          expiryDate: formattedExpiry,
          fluidLevel: 100, // New scans start full
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

  // Warning calculations
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
                className={`flex items-start p-3.5 rounded-xl border text-xs leading-relaxed ${
                  w.type === "expired" 
                    ? "bg-rose-50 border-rose-200 text-rose-800"
                    : w.type === "expiry"
                    ? "bg-amber-50 border-amber-200 text-amber-800"
                    : "bg-orange-50 border-orange-200 text-orange-800"
                }`}
              >
                <AlertTriangle size={14} className="mr-2 shrink-0 mt-0.5" />
                <span>{w.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* Shelf Scanner Simulator Input */}
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center space-x-2">
            <Sparkles size={16} className="text-rosevia-gold animate-pulse" />
            <h3 className="text-xs font-semibold tracking-widest uppercase text-rosevia-clay">Shelf Scanner Simulator</h3>
          </div>
          <p className="text-xs text-rosevia-clay/70">
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
              className="px-6 rounded-xl bg-rosevia-clay text-rosevia-cream text-xs font-semibold tracking-wider uppercase hover:bg-rosevia-charcoal transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center shrink-0"
            >
              {scanning ? "Extracting..." : "Scan Item"}
            </button>
          </div>
        </div>

        {/* Tiered Wooden Skincare Shelf View */}
        <div className="space-y-8 bg-rosevia-sand/20 border border-rosevia-rose/25 rounded-3xl p-6 relative overflow-hidden">
          {/* Glass glare effect overlay */}
          <div className="absolute top-0 right-0 w-[50%] h-[150%] bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none transform rotate-12" />

          {/* Categorized Shelves */}
          {["Cleanser", "Toner", "Serum", "Moisturizer"].map((cat) => {
            const items = cabinet.filter((p) => p.category === cat || (cat === "Moisturizer" && p.category === "SPF"));
            
            return (
              <div key={cat} className="space-y-4">
                <div className="flex justify-between items-center border-b border-rosevia-rose/25 pb-1">
                  <h4 className="text-[10px] tracking-widest font-bold uppercase text-rosevia-clay/70">{cat}s & Barriers</h4>
                  <span className="text-[9px] font-bold text-rosevia-clay/60 uppercase">{items.length} Bottle{items.length !== 1 && "s"}</span>
                </div>

                {items.length === 0 ? (
                  <p className="text-[10px] text-rosevia-clay/50 italic py-2 pl-2">No {cat.toLowerCase()}s on this shelf tier.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-2">
                    {items.map((prod) => (
                      <div 
                        key={prod.id} 
                        className="glass-card bg-white/70 p-4 rounded-xl relative flex flex-col justify-between space-y-3 group border border-rosevia-rose/30 shadow-sm"
                      >
                        {/* Expiry Badge */}
                        <div className="absolute top-3 right-3 flex items-center space-x-1 text-[8px] font-bold bg-rosevia-cream border border-rosevia-rose/40 px-1.5 py-0.5 rounded text-rosevia-clay/85">
                          <Clock size={8} /> <span>{prod.pao} PAO</span>
                        </div>

                        <div>
                          <h5 className="text-[11px] font-bold text-rosevia-charcoal leading-tight pr-10">
                            {prod.name}
                          </h5>
                          <span className="text-[9px] text-rosevia-clay/60 block mt-1 uppercase font-semibold">
                            {prod.category}
                          </span>
                        </div>

                        {/* Ingredients Tags mini drawer */}
                        <div className="flex flex-wrap gap-1">
                          {prod.ingredients.slice(0, 3).map((ing, i) => (
                            <span key={i} className="text-[8px] bg-rosevia-cream border border-rosevia-rose/20 text-rosevia-clay px-1 py-0.2 rounded">
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
                            <span>Liquid Remaining</span>
                            <span className={prod.fluidLevel <= 20 ? "text-rosevia-terracotta" : ""}>{prod.fluidLevel}%</span>
                          </div>
                          
                          {/* Progress Line */}
                          <div className="w-full h-1.5 bg-rosevia-cream border border-rosevia-rose/20 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${
                                prod.fluidLevel <= 20 ? "bg-rosevia-terracotta" : "bg-rosevia-gold"
                              }`} 
                              style={{ width: `${prod.fluidLevel}%` }} 
                            />
                          </div>

                          {/* Fluid Level Buttons & Delete */}
                          <div className="flex justify-between items-center pt-1.5">
                            <div className="flex space-x-1">
                              <button 
                                onClick={() => adjustFluidLevel(prod.id, -10)}
                                className="w-5 h-5 rounded-md border border-rosevia-rose/40 text-[9px] font-bold flex items-center justify-center bg-white cursor-pointer hover:bg-rosevia-rose/10"
                              >
                                -10
                              </button>
                              <button 
                                onClick={() => adjustFluidLevel(prod.id, 10)}
                                className="w-5 h-5 rounded-md border border-rosevia-rose/40 text-[9px] font-bold flex items-center justify-center bg-white cursor-pointer hover:bg-rosevia-rose/10"
                              >
                                +10
                              </button>
                            </div>
                            <button 
                              onClick={() => deleteProduct(prod.id)}
                              className="text-rosevia-clay/40 hover:text-rosevia-terracotta transition-all cursor-pointer"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                )}

                {/* Glass Shelf Bottom Border */}
                <div className="h-2 w-full bg-gradient-to-r from-rosevia-rose/10 via-rosevia-rose/45 to-rosevia-rose/10 rounded shadow-sm border-b border-white/60" />
              </div>
            );
          })}
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
