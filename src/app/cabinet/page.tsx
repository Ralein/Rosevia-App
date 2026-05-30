"use client";

import { useState, useEffect, useMemo } from "react";
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
  Settings,
  Calendar,
  X,
  Pill,
  Minus,
  Search,
  Star,
  StickyNote,
  Package,
  TrendingDown,
  ShieldAlert,
  Filter,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Eye,
  EyeOff
} from "lucide-react";
import { fetchDbState, postDbAction } from "@/lib/dbSync";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  name: string;
  category: string;
  pao: string;
  expiryDate: string; 
  fluidLevel: number; 
  ingredients: string[];
  totalTablets?: number;
  remainingTablets?: number;
  notes?: string;
  rating?: number;
  addedDate?: string;
}

/* Known actives that conflict when layered together */
const CONFLICT_PAIRS: [string[], string[], string][] = [
  [["retinol", "retinoid", "tretinoin"], ["vitamin c", "ascorbic acid", "l-ascorbic"], "Retinol + Vitamin C can cause irritation when layered together. Use AM/PM split."],
  [["retinol", "retinoid", "tretinoin"], ["aha", "glycolic", "lactic"], "Retinol + AHA can over-exfoliate. Alternate nights."],
  [["retinol", "retinoid", "tretinoin"], ["bha", "salicylic"], "Retinol + BHA can damage the moisture barrier. Use on separate nights."],
  [["retinol", "retinoid", "tretinoin"], ["benzoyl peroxide"], "Retinol + Benzoyl Peroxide cancel each other out. Use AM/PM split."],
  [["niacinamide"], ["vitamin c", "ascorbic acid"], "Niacinamide + Vitamin C at low pH may cause flushing. Use a buffered form."],
  [["aha", "glycolic", "lactic"], ["bha", "salicylic"], "AHA + BHA together can over-strip. Alternate usage days."],
];

const getInitials = (name?: string) => {
  if (!name) return "US";
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
};

export default function SmartCabinet() {
  const [cabinet, setCabinet] = useState<Product[]>([]);
  const [newProductName, setNewProductName] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scheduledStatus, setScheduledStatus] = useState<string | null>(null);
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("rosevia_theme") || "Midnight Jade";
    }
    return "Midnight Jade";
  });
  const [profileName, setProfileName] = useState("");

  // Custom Scheduler Modal States
  const [schedulingProduct, setSchedulingProduct] = useState<Product | null>(null);
  const [scheduleDays, setScheduleDays] = useState<string[]>(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]);
  const [scheduleSlot, setScheduleSlot] = useState<"am" | "pm" | "both">("both");

  // NEW: Search, filter, notes, ratings
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [showIngredients, setShowIngredients] = useState<Record<string, boolean>>({});
  
  const router = useRouter();

  const navigateTo = (path: string) => {
    router.push(path);
  };

  const defaultCabinet: Product[] = [];

  useEffect(() => {
    const loadData = async () => {
      const dbState = await fetchDbState();
      if (dbState) {
        if (dbState.cabinet) {
          setCabinet(dbState.cabinet);
          localStorage.setItem("rosevia_cabinet", JSON.stringify(dbState.cabinet));
        }
      } else {
        const savedCabinet = localStorage.getItem("rosevia_cabinet");
        if (savedCabinet) {
          setCabinet(JSON.parse(savedCabinet));
        } else {
          setCabinet(defaultCabinet);
          localStorage.setItem("rosevia_cabinet", JSON.stringify(defaultCabinet));
        }
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
    };

    loadData();
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
          glow: "border-rosevia-rosegold/75 shadow-[0_0_20px_rgba(232,193,200,0.2)]",
          shelf: "from-rosevia-rose-dark/95 to-rosevia-plum border border-rosevia-rose-light/40"
        };
      case "Polished Obsidian":
        return {
          bg: "bg-black text-[#E6E8E6]",
          card: "bg-neutral-950/80 border border-neutral-800 shadow-[0_4px_25px_rgba(0,0,0,0.85)]",
          accent: "text-neutral-400",
          gold: "text-rosevia-gold",
          button: "bg-neutral-900 border border-neutral-700 hover:border-rosevia-gold text-rosevia-charcoal",
          glow: "border-rosevia-gold/50 shadow-[0_0_15px_rgba(212,175,55,0.06)]",
          shelf: "from-neutral-950 to-neutral-900 border border-neutral-800"
        };
      case "Liquid Gold Premium":
        return {
          bg: "bg-[#060D0B] text-rosevia-charcoal",
          card: "bg-[#111C18]/85 border border-rosevia-gold/50 shadow-[0_4px_30px_rgba(212,175,55,0.12)]",
          accent: "text-rosevia-rose",
          gold: "text-rosevia-gold",
          button: "bg-rosevia-gold text-rosevia-cream hover:bg-rosevia-rose",
          glow: "border-rosevia-gold/75 shadow-[0_0_20px_rgba(212,175,55,0.2)]",
          shelf: "from-[#1a1106] to-[#0d0701] border border-rosevia-gold/40"
        };
      case "Midnight Jade":
      default:
        return {
          bg: "bg-rosevia-cream text-rosevia-charcoal",
          card: "glass-card bg-rosevia-sand/70 border border-rosevia-rose/25",
          accent: "text-rosevia-clay",
          gold: "text-rosevia-gold",
          button: "bg-rosevia-clay text-rosevia-cream hover:bg-rosevia-gold",
          glow: "border-rosevia-rose/30 shadow-xs",
          shelf: "from-[#111C18] to-[#070D0A] border border-[#162B22]"
        };
    }
  };

  const currentTheme = getThemeClasses();

  const saveCabinetToStorage = async (updatedCabinet: Product[]) => {
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

        const productCategory = data.product.category.toLowerCase();
        const isTablet = productCategory === "tablet" || productCategory === "tablets" || productCategory === "supplement" || productCategory === "supplements" || productCategory === "pill" || productCategory === "pills" || productCategory === "capsule" || productCategory === "capsules";
        const scannedProduct: Product = {
          id: `prod-${Date.now()}`,
          name: data.product.name,
          category: data.product.category,
          pao: data.product.pao || "12M",
          expiryDate: formattedExpiry,
          fluidLevel: 100, 
          ingredients: data.product.ingredients || ["Water", "Glycerin"],
          ...(isTablet && { totalTablets: 30, remainingTablets: 30 }),
          notes: "",
          rating: 0,
          addedDate: new Date().toISOString().split("T")[0]
        };

        const updated = [scannedProduct, ...cabinet];
        await saveCabinetToStorage(updated);
        await postDbAction("save_cabinet_item", { item: scannedProduct });
        setNewProductName("");
      }
    } catch (error) {
      console.error("Scanning failed, adding placeholder:", error);
    } finally {
      setScanning(false);
    }
  };

  const deleteProduct = async (id: string) => {
    const updated = cabinet.filter((p) => p.id !== id);
    await saveCabinetToStorage(updated);
    await postDbAction("delete_cabinet_item", { id });
  };

  const adjustFluidLevel = async (id: string, amount: number) => {
    let updatedItem: Product | null = null;
    const updated = cabinet.map((p) => {
      if (p.id === id) {
        const pCat = p.category.toLowerCase();
        const isTablet = pCat === "tablet" || pCat === "tablets" || pCat === "supplement" || pCat === "supplements" || pCat === "pill" || pCat === "pills" || pCat === "capsule" || pCat === "capsules";
        if (isTablet) {
          const nextRemaining = Math.max(0, Math.min(p.totalTablets || 30, (p.remainingTablets || 0) + amount));
          updatedItem = { ...p, remainingTablets: nextRemaining };
          return updatedItem;
        } else {
          const nextLevel = Math.max(0, Math.min(100, p.fluidLevel + amount));
          updatedItem = { ...p, fluidLevel: nextLevel };
          return updatedItem;
        }
      }
      return p;
    });
    setCabinet(updated);
    localStorage.setItem("rosevia_cabinet", JSON.stringify(updated));
    if (updatedItem) {
      await postDbAction("save_cabinet_item", { item: updatedItem });
    }
  };

  // NEW: Rating handler
  const setProductRating = async (id: string, rating: number) => {
    const updated = cabinet.map((p) => {
      if (p.id === id) return { ...p, rating };
      return p;
    });
    await saveCabinetToStorage(updated);
    const item = updated.find(p => p.id === id);
    if (item) await postDbAction("save_cabinet_item", { item });
  };

  // NEW: Notes handler
  const saveProductNotes = async (id: string, notes: string) => {
    const updated = cabinet.map((p) => {
      if (p.id === id) return { ...p, notes };
      return p;
    });
    await saveCabinetToStorage(updated);
    const item = updated.find(p => p.id === id);
    if (item) await postDbAction("save_cabinet_item", { item });
    setEditingNotes(null);
  };

  const handleSaveManualSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedulingProduct) return;

    const savedRoutine = localStorage.getItem("rosevia_routine");
    if (!savedRoutine) return;

    const routineObj = JSON.parse(savedRoutine);
    const updatedWeeklyCycle = { ...routineObj.weeklyCycle };
    const name = schedulingProduct.name;

    for (const day of scheduleDays) {
      if (!updatedWeeklyCycle[day]) {
        updatedWeeklyCycle[day] = { am: [], pm: [] };
      }
      if (scheduleSlot === "am" || scheduleSlot === "both") {
        if (!updatedWeeklyCycle[day].am.includes(name)) {
          updatedWeeklyCycle[day].am.push(name);
        }
      }
      if (scheduleSlot === "pm" || scheduleSlot === "both") {
        if (!updatedWeeklyCycle[day].pm.includes(name)) {
          updatedWeeklyCycle[day].pm.push(name);
        }
      }
    }

    routineObj.weeklyCycle = updatedWeeklyCycle;
    localStorage.setItem("rosevia_routine", JSON.stringify(routineObj));
    await postDbAction("save_routine", { routine: routineObj });

    setScheduledStatus(`"${name}" scheduled manually!`);
    setSchedulingProduct(null);
    setTimeout(() => setScheduledStatus(null), 3000);
  };

  const handleScheduleIntoRoutine = async (product: Product) => {
    const savedRoutine = localStorage.getItem("rosevia_routine");
    if (!savedRoutine) return;
    
    const routineObj = JSON.parse(savedRoutine);
    const updatedWeeklyCycle = { ...routineObj.weeklyCycle };
    const name = product.name;
    const cat = product.category.toLowerCase();
    const ingText = product.ingredients.join(" ").toLowerCase();

    if (cat.includes("cleans")) {
      for (const day of Object.keys(updatedWeeklyCycle)) {
        const cleanAm = updatedWeeklyCycle[day].am.filter((p: string) => !p.toLowerCase().includes("cleans"));
        updatedWeeklyCycle[day].am = [name, ...cleanAm];
        
        const cleanPm = updatedWeeklyCycle[day].pm.filter((p: string) => !p.toLowerCase().includes("cleans"));
        updatedWeeklyCycle[day].pm = [name, ...cleanPm];
      }
    } else if (cat.includes("spf") || cat.includes("sunscreen")) {
      for (const day of Object.keys(updatedWeeklyCycle)) {
        const cleanAm = updatedWeeklyCycle[day].am.filter((p: string) => !p.toLowerCase().includes("spf") && !p.toLowerCase().includes("sunscreen"));
        updatedWeeklyCycle[day].am = [...cleanAm, name];
      }
    } else if (ingText.includes("retinol") || ingText.includes("retinoid") || ingText.includes("tretinoin")) {
      const pmRetinolDays = ["tuesday", "thursday", "saturday", "sunday"];
      for (const day of pmRetinolDays) {
        const cleanPm = updatedWeeklyCycle[day].pm.filter((p: string) => !p.toLowerCase().includes("retin") && !p.toLowerCase().includes("tretin"));
        const cleanserIdx = cleanPm.findIndex((p: string) => p.toLowerCase().includes("cleans"));
        if (cleanserIdx !== -1) {
          cleanPm.splice(cleanserIdx + 1, 0, name);
        } else {
          cleanPm.unshift(name);
        }
        updatedWeeklyCycle[day].pm = cleanPm;
      }
    } else if (ingText.includes("ascorbic") || ingText.includes("vitamin c")) {
      const amVitCDays = ["monday", "wednesday", "friday", "sunday"];
      for (const day of amVitCDays) {
        const cleanAm = updatedWeeklyCycle[day].am.filter((p: string) => !p.toLowerCase().includes("vit") && !p.toLowerCase().includes("ascorbic"));
        const cleanserIdx = cleanAm.findIndex((p: string) => p.toLowerCase().includes("cleans"));
        if (cleanserIdx !== -1) {
          cleanAm.splice(cleanserIdx + 1, 0, name);
        } else {
          cleanAm.unshift(name);
        }
        updatedWeeklyCycle[day].am = cleanAm;
      }
    } else if (ingText.includes("salicylic") || ingText.includes("bha") || ingText.includes("glycolic") || ingText.includes("lactic") || ingText.includes("aha")) {
      const pmAcidDays = ["monday", "wednesday", "friday"];
      for (const day of pmAcidDays) {
        const cleanPm = updatedWeeklyCycle[day].pm.filter((p: string) => !p.toLowerCase().includes("bha") && !p.toLowerCase().includes("aha") && !p.toLowerCase().includes("salicyl") && !p.toLowerCase().includes("glycol"));
        const cleanserIdx = cleanPm.findIndex((p: string) => p.toLowerCase().includes("cleans"));
        if (cleanserIdx !== -1) {
          cleanPm.splice(cleanserIdx + 1, 0, name);
        } else {
          cleanPm.unshift(name);
        }
        updatedWeeklyCycle[day].pm = cleanPm;
      }
    } else if (cat.includes("moisturizer") || cat.includes("cream")) {
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
    await postDbAction("save_routine", { routine: routineObj });
    
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

      const pCat = p.category.toLowerCase();
      const isTablet = pCat === "tablet" || pCat === "tablets" || pCat === "supplement" || pCat === "supplements" || pCat === "pill" || pCat === "pills" || pCat === "capsule" || pCat === "capsules";
      if (isTablet) {
        if ((p.remainingTablets || 0) <= 5 && (p.remainingTablets || 0) > 0) {
          warnings.push({ type: "low", text: `"${p.name}" — only ${p.remainingTablets} tablets remaining. Reorder soon.` });
        }
      } else {
        if (p.fluidLevel <= 20 && p.fluidLevel > 0) {
          warnings.push({ type: "low", text: `"${p.name}" is running low (${p.fluidLevel}% left). Reorder warning triggered.` });
        }
      }
    }
    return warnings;
  };

  /* Cross-product ingredient conflict detection */
  const getConflictsForProduct = (product: Product): string[] => {
    const conflicts: string[] = [];
    const productIngs = product.ingredients.map(i => i.toLowerCase());
    
    for (const other of cabinet) {
      if (other.id === product.id) continue;
      const otherIngs = other.ingredients.map(i => i.toLowerCase());
      
      for (const [groupA, groupB, msg] of CONFLICT_PAIRS) {
        const prodHasA = productIngs.some(i => groupA.some(a => i.includes(a)));
        const prodHasB = productIngs.some(i => groupB.some(b => i.includes(b)));
        const otherHasA = otherIngs.some(i => groupA.some(a => i.includes(a)));
        const otherHasB = otherIngs.some(i => groupB.some(b => i.includes(b)));
        
        if ((prodHasA && otherHasB) || (prodHasB && otherHasA)) {
          const conflictMsg = `⚠️ ${product.name} × ${other.name}: ${msg}`;
          if (!conflicts.includes(conflictMsg)) {
            conflicts.push(conflictMsg);
          }
        }
      }
    }
    return conflicts;
  };

  const cabinetWarnings = checkWarnings();

  // NEW: Dashboard metrics
  const dashboardMetrics = useMemo(() => {
    const today = new Date();
    let lowStock = 0;
    let expiringSoon = 0;
    let totalConflicts = 0;
    const seenConflicts = new Set<string>();

    for (const p of cabinet) {
      // Low stock
      const pCat = p.category.toLowerCase();
      const isTablet = pCat === "tablet" || pCat === "tablets" || pCat === "supplement" || pCat === "supplements" || pCat === "pill" || pCat === "pills" || pCat === "capsule" || pCat === "capsules";
      if (isTablet) {
        if ((p.remainingTablets || 0) <= 5) lowStock++;
      } else {
        if (p.fluidLevel <= 20) lowStock++;
      }
      // Expiring
      const exp = new Date(p.expiryDate);
      const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 30) expiringSoon++;

      // Conflicts (deduplicated)
      const conflicts = getConflictsForProduct(p);
      for (const c of conflicts) {
        const sorted = c.split("×").map(s => s.trim()).sort().join("|");
        seenConflicts.add(sorted);
      }
    }
    totalConflicts = seenConflicts.size;

    const categories = new Set(cabinet.map(p => p.category));
    return { total: cabinet.length, lowStock, expiringSoon, totalConflicts, categories: Array.from(categories) };
  }, [cabinet]);

  // NEW: Filtered + searched cabinet
  const filteredCabinet = useMemo(() => {
    let result = cabinet;
    if (activeFilter !== "All") {
      result = result.filter(p => {
        const cat = p.category.toLowerCase();
        const filter = activeFilter.toLowerCase();
        if (filter === "moisturizer") return cat === "moisturizer" || cat === "spf" || cat === "cream";
        return cat === filter;
      });
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q) ||
        p.ingredients.some(i => i.toLowerCase().includes(q))
      );
    }
    return result;
  }, [cabinet, activeFilter, searchQuery]);

  /* --- SVG Vial Renderers --- */

  const RenderSkincareVial = ({ category, level }: { category: string; level: number }) => {
    const fillHeight = 36 - (36 * level) / 100;
    const fillPercent = level;

    let fluidColor = "#FAF7F2"; 
    if (category.toLowerCase().includes("toner")) fluidColor = "#D4AF37"; 
    if (category.toLowerCase().includes("serum")) fluidColor = "#688A7D"; 
    if (category.toLowerCase().includes("cleans")) fluidColor = "#93A39A"; 
    if (category.toLowerCase().includes("moist") || category.toLowerCase().includes("cream")) fluidColor = "#C5A880";
    if (category.toLowerCase().includes("mask")) fluidColor = "#A89CCC";

    if (category.toLowerCase().includes("serum")) {
      return (
        <svg className="w-12 h-20 text-rosevia-clay shrink-0 drop-shadow-sm" viewBox="0 0 40 70" fill="none">
          <rect x="17" y="2" width="6" height="8" rx="1" fill="#060D0B" />
          <rect x="14" y="10" width="12" height="6" fill="#D4AF37" />
          <rect x="16" y="16" width="8" height="6" fill="#D4AF37" opacity="0.3" />
          <path d="M8,22 C8,22 8,22 8,22 C8,22 32,22 32,22 C32,22 32,22 32,22 L32,60 C32,63 29,66 26,66 L14,66 C11,66 8,63 8,60 Z" fill="rgba(212, 175, 55, 0.08)" stroke="#D4AF37" strokeWidth="1.5" />
          <g clipPath="url(#bodyClipSerum)">
            <rect x="9" y={23 + fillHeight} width="22" height="42" fill={fluidColor} opacity="0.65" />
          </g>
          <clipPath id="bodyClipSerum">
            <path d="M9,23 L31,23 L31,59 C31,61 29,64 26,64 L14,64 C11,64 9,61 9,59 Z" />
          </clipPath>
          <line x1="20" y1="18" x2="20" y2="55" stroke="#D4AF37" strokeWidth="1.2" strokeDasharray="2 2" />
        </svg>
      );
    } else if (category.toLowerCase().includes("moisturizer") || category.toLowerCase().includes("spf") || category.toLowerCase().includes("cream")) {
      return (
        <svg className="w-16 h-16 text-rosevia-clay shrink-0 drop-shadow-sm" viewBox="0 0 50 50" fill="none">
          <rect x="8" y="4" width="34" height="6" rx="1.5" fill="#060D0B" />
          <rect x="10" y="10" width="30" height="2" fill="#D4AF37" />
          <path d="M4,13 C4,13 46,13 46,13 L43,41 C43,44 40,46 37,46 L13,46 C10,46 7,44 7,41 Z" fill="rgba(212, 175, 55, 0.08)" stroke="#D4AF37" strokeWidth="1.5" />
          <g clipPath="url(#bodyClipCream)">
            <rect x="5" y={14 + (28 - (28 * fillPercent) / 100)} width="40" height="30" fill={fluidColor} opacity="0.65" />
          </g>
          <clipPath id="bodyClipCream">
            <path d="M5,14 L45,14 L42,40 C42,42 40,44 37,44 L13,44 C10,44 8,42 8,40 Z" />
          </clipPath>
        </svg>
      );
    } else if (category.toLowerCase().includes("mask")) {
      /* Sheet mask packet SVG */
      return (
        <svg className="w-14 h-16 text-rosevia-clay shrink-0 drop-shadow-sm" viewBox="0 0 44 55" fill="none">
          <rect x="4" y="5" width="36" height="45" rx="4" fill="rgba(168, 156, 204, 0.1)" stroke="#A89CCC" strokeWidth="1.5" />
          <path d="M14,14 L30,14 L28,20 L22,24 L16,20 Z" fill="#A89CCC" opacity="0.35" />
          <circle cx="18" cy="17" r="1" fill="#A89CCC" opacity="0.7" />
          <circle cx="26" cy="17" r="1" fill="#A89CCC" opacity="0.7" />
          <path d="M20,22 Q22,23 24,22" stroke="#A89CCC" strokeWidth="0.8" fill="none" opacity="0.5" />
          <line x1="10" y1="32" x2="34" y2="32" stroke="#A89CCC" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.5" />
          <text x="22" y="42" textAnchor="middle" fill="#A89CCC" fontSize="5" fontWeight="bold" opacity="0.7">MASK</text>
        </svg>
      );
    } else {
      return (
        <svg className="w-12 h-20 text-rosevia-clay shrink-0 drop-shadow-sm" viewBox="0 0 34 70" fill="none">
          <rect x="11" y="2" width="12" height="12" rx="1" fill="#060D0B" />
          <rect x="6" y="15" width="22" height="50" rx="3" fill="rgba(212, 175, 55, 0.08)" stroke="#D4AF37" strokeWidth="1.5" />
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

  /* Tablet "Diffo" UI — Blister Pack Pill Grid */
  const RenderTabletBlister = ({ total, remaining }: { total: number; remaining: number }) => {
    const pills = Array.from({ length: Math.min(total, 30) });
    const taken = total - remaining;
    return (
      <div className="flex flex-wrap gap-[3px] max-w-[140px]">
        {pills.map((_, i) => (
          <div
            key={i}
            className={`w-[14px] h-[14px] rounded-full border transition-all duration-300 ${
              i < taken
                ? "bg-rosevia-sand/40 border-rosevia-rose/20 shadow-inner"
                : "bg-gradient-to-br from-rosevia-gold/60 to-rosevia-rose/40 border-rosevia-gold/50 shadow-sm"
            }`}
            title={i < taken ? "Taken" : "Remaining"}
          />
        ))}
      </div>
    );
  };

  /* Star Rating Component */
  const StarRating = ({ rating, onRate, size = 12 }: { rating: number; onRate: (r: number) => void; size?: number }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onRate(star === rating ? 0 : star)}
          className="cursor-pointer transition-all duration-200 hover:scale-125"
        >
          <Star
            size={size}
            className={`transition-colors duration-200 ${
              star <= rating
                ? "text-rosevia-gold fill-rosevia-gold"
                : "text-rosevia-rose/40"
            }`}
          />
        </button>
      ))}
    </div>
  );

  /* Shelf categories with display order */
  const SHELF_TIERS = ["Cleanser", "Toner", "Serum", "Moisturizer", "Tablet", "Mask"];
  const FILTER_CATS = ["All", ...SHELF_TIERS];

  const getShelfItems = (cat: string): Product[] => {
    const catLower = cat.toLowerCase();
    return filteredCabinet.filter((p) => {
      const pCat = p.category.toLowerCase();
      if (catLower === "moisturizer") return pCat === "moisturizer" || pCat === "spf" || pCat === "cream";
      if (catLower === "serum") return pCat === "serum" || pCat === "treatment";
      if (catLower === "tablet") return pCat === "tablet" || pCat === "supplement" || pCat === "supplements" || pCat === "tablets" || pCat === "pill" || pCat === "pills" || pCat === "capsule" || pCat === "capsules";
      return pCat === catLower;
    });
  };

  const getShelfLabel = (cat: string): string => {
    switch (cat) {
      case "Cleanser": return "Cleansers & Barriers";
      case "Toner": return "Toners & Essences";
      case "Serum": return "Serums & Treatments";
      case "Moisturizer": return "Moisturizers & SPF";
      case "Tablet": return "Supplements & Tablets";
      case "Mask": return "Sheet & Clay Masks";
      default: return cat;
    }
  };

  return (
    <div className={`min-h-screen ${currentTheme.bg} pb-28 select-none transition-colors duration-500`}>
      
      <div className="max-w-4xl mx-auto px-4 pt-6 md:pt-10 flex flex-col space-y-6 animate-fade-in">
        
        {/* Header Title */}
        <header className="flex justify-between items-start">
          <div>
            <h1 className={`text-xs tracking-widest font-bold ${currentTheme.accent} uppercase`}>Cosmeceutical Library</h1>
            <p className="text-2xl md:text-3xl font-serif tracking-tight font-light mt-1">
              Digital Cabinet & <span className={`italic ${currentTheme.gold} font-normal`}>Shelf Scanner</span>
            </p>
          </div>
          
          <button 
            onClick={() => navigateTo("/")}
            className={`w-10 h-10 rounded-full bg-gradient-to-tr from-rosevia-gold/30 to-rosevia-rose/30 border border-rosevia-gold/50 flex items-center justify-center font-serif text-xs font-bold ${currentTheme.gold} hover:shadow-lg transition-all shrink-0 cursor-pointer`}
          >
            {getInitials(profileName)}
          </button>
        </header>

        {/* === NEW: Search & Filter Bar === */}
        <div className={`${currentTheme.card} p-4 space-y-3 shadow-sm`}>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-rosevia-clay/50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, ingredients, categories..."
                className="w-full bg-rosevia-sand border border-rosevia-rose/30 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:ring-1 focus:ring-rosevia-gold focus:outline-none text-rosevia-charcoal font-medium placeholder-rosevia-clay/40"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-rosevia-clay/50 hover:text-rosevia-gold cursor-pointer"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
          {/* Category Filter Chips */}
          <div className="flex flex-wrap gap-1.5">
            {FILTER_CATS.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`text-[9px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider border transition-all duration-300 cursor-pointer ${
                  activeFilter === cat
                    ? "bg-rosevia-gold text-rosevia-cream border-rosevia-gold shadow-sm"
                    : "bg-rosevia-cream border-rosevia-rose/30 text-rosevia-clay hover:border-rosevia-gold/50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          {searchQuery && (
            <p className={`text-[10px] ${currentTheme.accent} font-semibold`}>
              {filteredCabinet.length} result{filteredCabinet.length !== 1 ? "s" : ""} found
            </p>
          )}
        </div>

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
        <div className={`${currentTheme.card} p-6 space-y-4 shadow-sm`}>
          <div className="flex items-center space-x-2">
            <Sparkles size={16} className={`${currentTheme.gold} animate-pulse`} />
            <h3 className={`text-xs font-semibold tracking-widest uppercase ${currentTheme.accent}`}>Shelf Scanner Simulator</h3>
          </div>
          <p className={`text-xs ${currentTheme.accent} opacity-90 leading-relaxed font-medium`}>
            Type any brand product (e.g. <i>&quot;Paula&apos;s Choice BHA&quot;</i>, <i>&quot;Vitamin D3 Tablets&quot;</i>, or <i>&quot;Innisfree Clay Mask&quot;</i>) to simulate photo scanner extraction. Our AI extracts branded naming and full active ingredients.
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={newProductName}
              onChange={(e) => setNewProductName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleScanProduct(); }}
              placeholder="Enter product brand name to scan..."
              disabled={scanning}
              className="flex-1 bg-rosevia-sand border border-rosevia-rose/30 rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-rosevia-gold focus:outline-none disabled:opacity-50 text-rosevia-charcoal font-medium placeholder-rosevia-clay/40"
            />
            <button
              onClick={handleScanProduct}
              disabled={scanning || !newProductName.trim()}
              className={`px-6 rounded-xl text-rosevia-cream text-xs font-bold tracking-wider uppercase transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center shrink-0 shadow-sm ${currentTheme.button}`}
            >
              {scanning ? <Loader2 size={14} className="animate-spin" /> : "Scan Item"}
            </button>
          </div>
        </div>

        {/* Tiered Skincare Shelf View */}
        <div className={`space-y-8 bg-gradient-to-b ${currentTheme.shelf} rounded-3xl p-6 relative overflow-hidden shadow-md`}>
          <div className="absolute top-0 right-0 w-[50%] h-[150%] bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none transform rotate-12" />

          {SHELF_TIERS.map((cat) => {
            const items = getShelfItems(cat);
            const isTabletTier = cat === "Tablet";
            
            // Hide empty shelves when filtering
            if (activeFilter !== "All" && items.length === 0) return null;

            return (
              <div key={cat} className="space-y-4 relative">
                <div className="flex justify-between items-center border-b border-rosevia-rose/25 pb-1">
                  <h4 className={`text-[10px] tracking-widest font-bold uppercase ${currentTheme.gold}`}>{getShelfLabel(cat)}</h4>
                  <span className={`text-[9px] font-bold ${currentTheme.accent} uppercase`}>
                    {items.length} {isTabletTier ? "Bottle" : "Item"}{items.length !== 1 && "s"}
                  </span>
                </div>

                {items.length === 0 ? (
                  <p className={`text-[10px] ${currentTheme.accent} opacity-60 italic py-2 pl-2`}>No {cat.toLowerCase()}s on this shelf tier.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-2">
                    {items.map((prod) => {
                      const prodConflicts = getConflictsForProduct(prod);
                      const pCat = prod.category.toLowerCase();
                      const isTablet = pCat === "tablet" || pCat === "tablets" || pCat === "supplement" || pCat === "supplements" || pCat === "pill" || pCat === "pills" || pCat === "capsule" || pCat === "capsules";
                      const isExpanded = expandedProduct === prod.id;
                      const isShowingIngredients = showIngredients[prod.id];
                      const daysUntilExpiry = Math.ceil((new Date(prod.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                      
                      return (
                        <div 
                          key={prod.id} 
                          className={`bg-rosevia-sand/85 p-4 rounded-xl relative flex flex-col justify-between space-y-3 group border border-rosevia-rose/30 shadow-sm transition-all duration-300 hover:border-rosevia-gold/50 hover:shadow-md ${
                            daysUntilExpiry <= 0 ? "ring-1 ring-rose-500/40" : ""
                          }`}
                        >
                          {/* Status Badges Row */}
                          <div className="absolute top-3 right-3 flex items-center gap-1.5">
                            {daysUntilExpiry <= 30 && daysUntilExpiry > 0 && (
                              <span className="text-[7px] font-bold bg-amber-100 border border-amber-300/60 px-1.5 py-0.5 rounded text-amber-700 animate-pulse">
                                {daysUntilExpiry}d left
                              </span>
                            )}
                            {daysUntilExpiry <= 0 && (
                              <span className="text-[7px] font-bold bg-rose-100 border border-rose-300/60 px-1.5 py-0.5 rounded text-rose-700">
                                EXPIRED
                              </span>
                            )}
                            <div className="flex items-center space-x-1 text-[8px] font-bold bg-rosevia-cream border border-rosevia-rose/40 px-1.5 py-0.5 rounded text-rosevia-gold">
                              <Clock size={8} /> <span>{prod.pao} PAO</span>
                            </div>
                          </div>

                          {/* Conflict Warning Badge */}
                          {prodConflicts.length > 0 && (
                            <div className="absolute top-3 left-3">
                              <div className="relative group/conflict">
                                <div className="w-5 h-5 rounded-full bg-amber-500/90 flex items-center justify-center animate-pulse shadow-md cursor-help">
                                  <AlertTriangle size={10} className="text-white stroke-[3]" />
                                </div>
                                <div className="hidden group-hover/conflict:block absolute left-0 top-6 z-30 w-56 bg-rosevia-cream border border-amber-500/40 rounded-xl p-3 shadow-lg">
                                  {prodConflicts.map((c, ci) => (
                                    <p key={ci} className="text-[9px] text-rosevia-clay font-semibold leading-relaxed mb-1.5 last:mb-0">{c}</p>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Top layout */}
                          <div className="flex items-center space-x-3 pt-1">
                            {isTablet ? (
                              <div className="shrink-0">
                                <RenderTabletBlister total={prod.totalTablets || 30} remaining={prod.remainingTablets || 0} />
                              </div>
                            ) : (
                              <RenderSkincareVial category={prod.category} level={prod.fluidLevel} />
                            )}
                            <div className="flex-1 min-w-0">
                              <h5 className="text-[11px] font-bold text-rosevia-charcoal leading-tight pr-6 truncate">
                                {prod.name}
                              </h5>
                              <span className="text-[8px] text-rosevia-gold block mt-1 uppercase font-bold tracking-wider">
                                {prod.category}
                              </span>
                              {isTablet && (
                                <span className="text-[9px] text-rosevia-clay font-bold block mt-1">
                                  {prod.remainingTablets || 0} / {prod.totalTablets || 30} tablets remaining
                                </span>
                              )}
                              {/* Star Rating */}
                              <div className="mt-1.5">
                                <StarRating 
                                  rating={prod.rating || 0} 
                                  onRate={(r) => setProductRating(prod.id, r)} 
                                />
                              </div>
                            </div>
                          </div>

                          {/* Ingredients Toggle */}
                          <div>
                            <button
                              onClick={() => setShowIngredients(prev => ({ ...prev, [prod.id]: !prev[prod.id] }))}
                              className="flex items-center gap-1 text-[9px] font-bold text-rosevia-clay/70 hover:text-rosevia-gold transition-colors cursor-pointer uppercase tracking-wider"
                            >
                              {isShowingIngredients ? <EyeOff size={10} /> : <Eye size={10} />}
                              {isShowingIngredients ? "Hide" : "Show"} Ingredients ({prod.ingredients.length})
                            </button>
                            {isShowingIngredients && (
                              <div className="flex flex-wrap gap-1 mt-1.5 animate-fade-in">
                                {prod.ingredients.map((ing, i) => (
                                  <span key={i} className="text-[8px] bg-rosevia-cream border border-rosevia-rose/25 text-rosevia-clay px-1.5 py-0.5 rounded font-medium">
                                    {ing}
                                  </span>
                                ))}
                              </div>
                            )}
                            {!isShowingIngredients && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {prod.ingredients.slice(0, 3).map((ing, i) => (
                                  <span key={i} className="text-[8px] bg-rosevia-cream border border-rosevia-rose/25 text-rosevia-clay px-1.5 py-0.5 rounded font-medium">
                                    {ing}
                                  </span>
                                ))}
                                {prod.ingredients.length > 3 && (
                                  <span className="text-[8px] text-rosevia-gold font-bold self-center ml-0.5">+{prod.ingredients.length - 3}</span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Progress / Tablet Count */}
                          <div className="space-y-1.5 border-t border-rosevia-rose/15 pt-2">
                            {isTablet ? (
                              <>
                                <div className="flex justify-between items-center text-[9px] font-bold text-rosevia-clay">
                                  <span>Dosage Tracker</span>
                                  <span className={(prod.remainingTablets || 0) <= 5 ? "text-rosevia-terracotta" : ""}>
                                    {prod.remainingTablets || 0} left
                                  </span>
                                </div>
                                <div className="w-full h-1.5 bg-rosevia-cream border border-rosevia-rose/20 rounded-full overflow-hidden shadow-inner">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-300 ${
                                      (prod.remainingTablets || 0) <= 5 ? "bg-rosevia-terracotta" : "bg-rosevia-gold"
                                    }`} 
                                    style={{ width: `${((prod.remainingTablets || 0) / (prod.totalTablets || 30)) * 100}%` }} 
                                  />
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex justify-between items-center text-[9px] font-bold text-rosevia-clay">
                                  <span>Remaining Capacity</span>
                                  <span className={prod.fluidLevel <= 20 ? "text-rosevia-terracotta" : ""}>{prod.fluidLevel}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-rosevia-cream border border-rosevia-rose/20 rounded-full overflow-hidden shadow-inner">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-300 ${
                                      prod.fluidLevel <= 20 ? "bg-rosevia-terracotta" : "bg-rosevia-gold"
                                    }`} 
                                    style={{ width: `${prod.fluidLevel}%` }} 
                                  />
                                </div>
                              </>
                            )}

                            {/* Action Buttons */}
                            <div className="flex justify-between items-center pt-1.5">
                              <div className="flex space-x-1 bg-rosevia-cream p-0.5 rounded-md border border-rosevia-rose/25">
                                <button 
                                  onClick={() => adjustFluidLevel(prod.id, isTablet ? -1 : -10)}
                                  className="w-5 h-5 rounded border border-rosevia-rose/20 text-[9px] font-bold flex items-center justify-center bg-rosevia-sand cursor-pointer hover:bg-rosevia-gold/20 transition-all shadow-xs text-rosevia-clay hover:text-rosevia-gold"
                                  title={isTablet ? "Log 1 dose taken" : "Decrease level"}
                                >
                                  <Minus size={9} />
                                </button>
                                <button 
                                  onClick={() => adjustFluidLevel(prod.id, isTablet ? 1 : 10)}
                                  className="w-5 h-5 rounded border border-rosevia-rose/20 text-[9px] font-bold flex items-center justify-center bg-rosevia-sand cursor-pointer hover:bg-rosevia-gold/20 transition-all shadow-xs text-rosevia-clay hover:text-rosevia-gold"
                                  title={isTablet ? "Add tablet back" : "Increase level"}
                                >
                                  +
                                </button>
                              </div>

                              <div className="flex items-center gap-1">
                                {/* Notes Button */}
                                <button
                                  onClick={() => {
                                    if (editingNotes === prod.id) {
                                      setEditingNotes(null);
                                    } else {
                                      setEditingNotes(prod.id);
                                      setNoteText(prod.notes || "");
                                    }
                                  }}
                                  className={`px-1.5 py-1 rounded border text-[8px] font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer flex items-center gap-0.5 shadow-xs ${
                                    prod.notes 
                                      ? "bg-rosevia-sage/20 border-rosevia-sage/40 text-rosevia-sage hover:bg-rosevia-sage/30"
                                      : "bg-rosevia-gold/10 border-rosevia-gold/25 text-rosevia-gold/70 hover:bg-rosevia-gold/20 hover:text-rosevia-gold"
                                  }`}
                                  title="Product notes"
                                >
                                  <StickyNote size={8} />
                                </button>

                                {/* Schedule Button */}
                                <button
                                  onClick={() => setSchedulingProduct(prod)}
                                  className="px-2 py-1 rounded bg-rosevia-gold/15 border border-rosevia-gold/30 hover:bg-rosevia-gold hover:text-rosevia-cream text-[8px] font-bold tracking-wider uppercase text-rosevia-gold transition-all duration-300 cursor-pointer flex items-center gap-1 shadow-xs"
                                  title="Schedule product into your routine"
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

                            {/* Notes Editor (Expanded) */}
                            {editingNotes === prod.id && (
                              <div className="mt-2 space-y-2 animate-fade-in border-t border-rosevia-rose/15 pt-2">
                                <textarea
                                  value={noteText}
                                  onChange={(e) => setNoteText(e.target.value)}
                                  placeholder="Add personal notes... (e.g. 'Caused mild tingling first week, adjusted to every other night')"
                                  className="w-full bg-rosevia-cream border border-rosevia-rose/30 rounded-lg px-3 py-2 text-[10px] focus:ring-1 focus:ring-rosevia-gold focus:outline-none text-rosevia-charcoal font-medium placeholder-rosevia-clay/40 resize-none"
                                  rows={3}
                                />
                                <div className="flex gap-1.5">
                                  <button
                                    onClick={() => saveProductNotes(prod.id, noteText)}
                                    className="px-3 py-1.5 rounded-lg bg-rosevia-gold/15 border border-rosevia-gold/30 text-[9px] font-bold tracking-wider uppercase text-rosevia-gold hover:bg-rosevia-gold hover:text-rosevia-cream cursor-pointer transition-all flex items-center gap-1"
                                  >
                                    <CheckCircle size={10} /> Save
                                  </button>
                                  <button
                                    onClick={() => setEditingNotes(null)}
                                    className="px-3 py-1.5 rounded-lg bg-rosevia-cream border border-rosevia-rose/30 text-[9px] font-bold tracking-wider uppercase text-rosevia-clay hover:text-rosevia-gold cursor-pointer transition-all"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Saved Note Display */}
                            {prod.notes && editingNotes !== prod.id && (
                              <div className="mt-1.5 bg-rosevia-cream/60 border border-rosevia-rose/15 rounded-lg p-2">
                                <p className="text-[9px] text-rosevia-clay/80 font-medium leading-relaxed italic">
                                  📝 {prod.notes}
                                </p>
                              </div>
                            )}
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Shelf Footing */}
                <div className={`relative h-3.5 w-full rounded-t-sm shadow-md border-t ${theme === "Rose Quartz Luxury" ? "border-rosevia-rose-light/50 bg-gradient-to-b from-rosevia-rose-light/30 to-rosevia-rosegold/10" : "border-rosevia-gold/40 bg-gradient-to-b from-rosevia-gold/25 to-rosevia-rose/10"}`}>
                  <div className="absolute bottom-0 w-full h-[3px] bg-rosevia-gold/40 shadow-inner" />
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* SCHEDULING MODAL — AI Auto or Manual */}
      {schedulingProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl relative shadow-xl space-y-5">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-rosevia-rose/20 pb-3">
              <div>
                <h3 className="text-xs font-bold tracking-widest uppercase text-rosevia-charcoal flex items-center gap-1.5">
                  <CalendarDays size={14} className="text-rosevia-gold" /> Schedule: {schedulingProduct.name}
                </h3>
              </div>
              <button 
                onClick={() => setSchedulingProduct(null)}
                className="text-rosevia-clay hover:text-rosevia-gold transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* AI Auto-Schedule */}
            <button
              onClick={() => {
                handleScheduleIntoRoutine(schedulingProduct);
                setSchedulingProduct(null);
              }}
              className="w-full p-4 rounded-xl bg-gradient-to-r from-rosevia-gold/20 to-rosevia-rose/10 border border-rosevia-gold/40 text-left space-y-1 hover:border-rosevia-gold hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-rosevia-gold group-hover:animate-spin" />
                <span className="text-xs font-bold text-rosevia-charcoal uppercase tracking-wider">AI Auto-Schedule</span>
              </div>
              <p className="text-[10px] text-rosevia-clay font-semibold leading-relaxed">
                Let the AI cosmetologist assign this product to optimal days and AM/PM slots based on its active ingredients and your existing routine.
              </p>
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-rosevia-rose/25" />
              <span className="text-[9px] text-rosevia-clay font-bold uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-rosevia-rose/25" />
            </div>

            {/* Manual Schedule Form */}
            <form onSubmit={handleSaveManualSchedule} className="space-y-4">
              <h4 className="text-[10px] font-bold text-rosevia-charcoal uppercase tracking-wider">Manual Schedule</h4>
              
              {/* Day Checkboxes */}
              <div className="space-y-2">
                <p className="text-[9px] text-rosevia-clay font-bold uppercase">Select Days</p>
                <div className="flex flex-wrap gap-1.5">
                  {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        if (scheduleDays.includes(day)) {
                          setScheduleDays(scheduleDays.filter(d => d !== day));
                        } else {
                          setScheduleDays([...scheduleDays, day]);
                        }
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wide border transition-all cursor-pointer ${
                        scheduleDays.includes(day)
                          ? "bg-rosevia-gold text-rosevia-cream border-rosevia-gold shadow-sm"
                          : "bg-rosevia-cream border-rosevia-rose/30 text-rosevia-clay hover:border-rosevia-gold/50"
                      }`}
                    >
                      {day.substring(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Slot Selection */}
              <div className="space-y-2">
                <p className="text-[9px] text-rosevia-clay font-bold uppercase">Select Slot</p>
                <div className="flex gap-2">
                  {(["am", "pm", "both"] as const).map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setScheduleSlot(slot)}
                      className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                        scheduleSlot === slot
                          ? "bg-rosevia-gold text-rosevia-cream border-rosevia-gold shadow-sm"
                          : "bg-rosevia-cream border-rosevia-rose/30 text-rosevia-clay hover:border-rosevia-gold/50"
                      }`}
                    >
                      {slot === "both" ? "AM + PM" : slot.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={scheduleDays.length === 0}
                className="w-full py-3 rounded-xl bg-rosevia-clay text-rosevia-cream text-xs tracking-widest font-bold uppercase hover:bg-rosevia-gold transition-all shadow cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                <CheckCircle size={12} /> Apply Manual Schedule
              </button>
            </form>
          </div>
        </div>
      )}

      <nav className={`fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-lg py-3 px-4 rounded-2xl flex justify-between items-center shadow-lg backdrop-blur-md z-50 ${
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
          className={`flex flex-col items-center ${theme === "Rose Quartz Luxury" ? "text-rosevia-rosegold/60 hover:text-rosevia-rosegold" : "text-rosevia-clay hover:text-rosevia-gold"} shrink-0 cursor-pointer`}
        >
          <Activity size={18} />
          <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">Scan</span>
        </button>
        <button 
          onClick={() => navigateTo("/cabinet")}
          className={`flex flex-col items-center ${theme === "Rose Quartz Luxury" ? "text-rosevia-rosegold" : "text-rosevia-gold"} shrink-0 cursor-pointer`}
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
          onClick={() => navigateTo("/calendar")}
          className={`flex flex-col items-center ${theme === "Rose Quartz Luxury" ? "text-rosevia-rosegold/60 hover:text-rosevia-rosegold" : "text-rosevia-clay hover:text-rosevia-gold"} shrink-0 cursor-pointer`}
        >
          <Calendar size={18} />
          <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">Calendar</span>
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
