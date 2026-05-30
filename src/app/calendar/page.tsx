"use client";

import { useState, useEffect } from "react";
import { 
  Calendar,
  Layers, 
  Activity, 
  FolderHeart, 
  AlertCircle, 
  BookOpen, 
  Settings, 
  Plus, 
  Clock, 
  Check, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  CheckCircle,
  X
} from "lucide-react";
import confetti from "canvas-confetti";
import { fetchDbState, postDbAction } from "@/lib/dbSync";
import { useRouter } from "next/navigation";

const getInitials = (name?: string) => {
  if (!name) return "US";
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
};

interface CalendarEvent {
  id: string;
  title: string;
  eventDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  category: string; // 'Treatment' | 'Mask' | 'Exfoliation' | 'Consultation' | 'Other'
  completed: boolean;
  notes: string;
}

interface Routine {
  routineName: string;
  focus: string;
  weeklyCycle: Record<string, { am: string[]; pm: string[] }>;
  tips: string[];
}

export default function TeamsSkincareCalendar() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<any>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("rosevia_profile");
      if (saved) return JSON.parse(saved);
    }
    return null;
  });
  const [routine, setRoutine] = useState<Routine | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("rosevia_routine");
      if (saved) return JSON.parse(saved);
    }
    return null;
  });
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [theme, setTheme] = useState("Midnight Jade");
  const [reminders, setReminders] = useState({
    serumTimeAM: "08:00",
    serumTimePM: "21:30",
    moistTimeAM: "08:15",
    moistTimePM: "21:45",
    spfTime: "09:00",
    spfInterval: 2
  });
  
  // Date states
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(new Date());
  
  // Modal states
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventStartTime, setEventStartTime] = useState("08:00");
  const [eventEndTime, setEventEndTime] = useState("08:30");
  const [eventCategory, setEventCategory] = useState("Treatment");
  const [eventNotes, setEventNotes] = useState("");

  const navigateTo = (path: string) => {
    router.push(path);
  };

  useEffect(() => {
    setMounted(true);
    
    // Get start of current week (Monday)
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    setCurrentWeekStart(new Date(today.setDate(diff)));

    const loadData = async () => {
      const dbState = await fetchDbState();
      
      let loadedProfile = null;
      let loadedRoutine = null;

      if (dbState) {
        if (dbState.profile) {
          loadedProfile = dbState.profile;
          setProfile(loadedProfile);
          localStorage.setItem("rosevia_profile", JSON.stringify(loadedProfile));
        }
        if (dbState.routine) {
          loadedRoutine = dbState.routine;
          setRoutine(loadedRoutine);
          localStorage.setItem("rosevia_routine", JSON.stringify(loadedRoutine));
        }
        if (dbState.calendarEvents) {
          setEvents(dbState.calendarEvents);
        }
      }

      if (!loadedProfile) {
        const savedProfile = localStorage.getItem("rosevia_profile");
        if (savedProfile) {
          const p = JSON.parse(savedProfile);
          setProfile(p);
          postDbAction("save_profile", { profile: p });
        }
      }

      if (!loadedRoutine) {
        const savedRoutine = localStorage.getItem("rosevia_routine");
        if (savedRoutine) {
          const r = JSON.parse(savedRoutine);
          setRoutine(r);
          postDbAction("save_routine", { routine: r });
        }
      }

      const savedTheme = localStorage.getItem("rosevia_theme");
      if (savedTheme) {
        setTheme(savedTheme);
      }

      const savedReminders = localStorage.getItem("rosevia_reminders");
      if (savedReminders) {
        try {
          setReminders(JSON.parse(savedReminders));
        } catch (e) {}
      }
    };

    loadData();
  }, []);

  const quickScheduleRoutine = async (dateStr: string, period: "am" | "pm") => {
    if (!routine) return;
    const dateObj = new Date(dateStr);
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const dayNameLower = days[dateObj.getDay()];
    const tasks = routine.weeklyCycle[dayNameLower]?.[period] || [];
    if (tasks.length === 0) return;

    const startTime = period === "am" ? (reminders.serumTimeAM || "08:00") : (reminders.serumTimePM || "21:30");
    const endTime = period === "am" ? (reminders.moistTimeAM || "08:15") : (reminders.moistTimePM || "21:45");

    const newEvent: CalendarEvent = {
      id: `evt-${Date.now()}-${period}`,
      title: `${period.toUpperCase()} Routine`,
      eventDate: dateStr,
      startTime,
      endTime,
      category: "Treatment",
      completed: false,
      notes: tasks.join(", ")
    };

    const res = await postDbAction("save_calendar_event", { event: newEvent });
    if (res && res.success) {
      setEvents(prev => [...prev, newEvent]);
      confetti({
        particleCount: 50,
        spread: 30,
        colors: ["#D4AF37", "#FAF7F2"]
      });
    }
  };

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
          colHeader: "bg-rosevia-rose-dark/95 border-rosevia-rose-light/20 text-rosevia-rosegold",
          teamsBlue: "border-rosevia-rose-light bg-rosevia-rose-dark/70 text-rosevia-rosegold"
        };
      case "Polished Obsidian":
        return {
          bg: "bg-black text-[#E6E8E6]",
          card: "bg-neutral-950/80 border border-neutral-800 shadow-[0_4px_25px_rgba(0,0,0,0.85)]",
          accent: "text-neutral-400",
          gold: "text-rosevia-gold",
          button: "bg-neutral-900 border border-neutral-700 hover:border-rosevia-gold text-rosevia-charcoal",
          glow: "border-rosevia-gold/50 shadow-[0_0_15px_rgba(212,175,55,0.06)]",
          colHeader: "bg-neutral-950 border-neutral-800 text-[#E6E8E6]",
          teamsBlue: "border-rosevia-gold/40 bg-neutral-900 text-rosevia-gold"
        };
      case "Liquid Gold Premium":
        return {
          bg: "bg-[#060D0B] text-rosevia-charcoal",
          card: "bg-[#111C18]/85 border border-rosevia-gold/50 shadow-[0_4px_30px_rgba(212,175,55,0.12)]",
          accent: "text-rosevia-rose",
          gold: "text-rosevia-gold",
          button: "bg-rosevia-gold text-rosevia-cream hover:bg-rosevia-rose",
          glow: "border-rosevia-gold/75 shadow-[0_0_20px_rgba(212,175,55,0.2)]",
          colHeader: "bg-[#111C18] border-rosevia-gold/25 text-rosevia-gold",
          teamsBlue: "border-rosevia-gold bg-[#111C18] text-rosevia-gold"
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
          colHeader: "bg-[#111C18] border-rosevia-rose/20 text-rosevia-clay",
          teamsBlue: "border-rosevia-gold/45 bg-[#172A23] text-rosevia-gold"
        };
    }
  };

  const currentTheme = getThemeClasses();

  // Get date of days of the current week (Monday-Sunday)
  const getDaysOfWeek = () => {
    const days = [];
    const names = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      days.push({
        name: names[i],
        date: date,
        formatted: date.toISOString().split("T")[0],
        dayNumber: date.getDate()
      });
    }
    return days;
  };

  const weekDays = getDaysOfWeek();

  const handlePrevWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(newStart);
  };

  const handleNextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || !eventDate) return;

    const newEvent: CalendarEvent = {
      id: `evt-${Date.now()}`,
      title: eventTitle,
      eventDate,
      startTime: eventStartTime,
      endTime: eventEndTime,
      category: eventCategory,
      completed: false,
      notes: eventNotes
    };

    const res = await postDbAction("save_calendar_event", { event: newEvent });
    if (res && res.success) {
      setEvents([...events, newEvent]);
      confetti({
        particleCount: 50,
        spread: 30,
        colors: ["#D4AF37", "#FAF7F2"]
      });
      // Reset state
      setEventTitle("");
      setEventNotes("");
      setShowEventModal(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    const res = await postDbAction("delete_calendar_event", { id });
    if (res && res.success) {
      setEvents(events.filter(e => e.id !== id));
    }
  };

  const toggleEventComplete = async (event: CalendarEvent) => {
    const updated = { ...event, completed: !event.completed };
    const res = await postDbAction("save_calendar_event", { event: updated });
    if (res && res.success) {
      setEvents(events.map(e => e.id === event.id ? updated : e));
      if (updated.completed) {
        confetti({
          particleCount: 40,
          spread: 40,
          colors: ["#688A7D", "#D4AF37"]
        });
      }
    }
  };

  const getEventCategoryStyle = (category: string) => {
    switch (category) {
      case "Treatment":
        return "border-l-4 border-rosevia-terracotta bg-rose-950/20 text-rose-300";
      case "Mask":
        return "border-l-4 border-blue-500 bg-blue-950/20 text-blue-300";
      case "Exfoliation":
        return "border-l-4 border-rosevia-gold bg-amber-950/20 text-rosevia-gold";
      case "Consultation":
        return "border-l-4 border-rosevia-sage bg-emerald-950/20 text-rosevia-sage";
      default:
        return "border-l-4 border-rosevia-clay bg-neutral-900/60 text-rosevia-clay";
    }
  };

  const getFormattedWeekRange = () => {
    const startMonth = currentWeekStart.toLocaleString("en-US", { month: "short" });
    const end = new Date(currentWeekStart);
    end.setDate(currentWeekStart.getDate() + 6);
    const endMonth = end.toLocaleString("en-US", { month: "short" });
    const year = currentWeekStart.getFullYear();

    if (startMonth === endMonth) {
      return `${startMonth} ${currentWeekStart.getDate()} - ${end.getDate()}, ${year}`;
    }
    return `${startMonth} ${currentWeekStart.getDate()} - ${endMonth} ${end.getDate()}, ${year}`;
  };

  if (!mounted) return null;

  return (
    <div className={`min-h-screen ${currentTheme.bg} pb-28 select-none transition-colors duration-500`}>
      <div className="max-w-7xl mx-auto px-4 pt-6 md:pt-10 flex flex-col space-y-6 animate-fade-in">
        
        {/* Header Title */}
        <header className="flex justify-between items-start">
          <div>
            <h1 className={`text-xs tracking-widest font-bold ${currentTheme.accent} uppercase`}>Teams Skincare Planner</h1>
            <p className="text-2xl md:text-3xl font-serif tracking-tight font-light mt-1">
              Teams-Style <span className={`italic ${currentTheme.gold} font-normal`}>Routine Calendar</span>
            </p>
          </div>
          
          <button 
            onClick={() => navigateTo("/")}
            className={`w-10 h-10 rounded-full bg-gradient-to-tr from-rosevia-gold/30 to-rosevia-rose/30 border border-rosevia-gold/50 flex items-center justify-center font-serif text-xs font-bold ${currentTheme.gold} hover:shadow-lg transition-all shrink-0 cursor-pointer`}
          >
            {getInitials(profile?.name)}
          </button>
        </header>

        {/* Teams-style Top Control Bar */}
        <div className={`flex flex-col sm:flex-row justify-between items-center p-4 rounded-2xl gap-4 shadow-sm border ${
          theme === "Rose Quartz Luxury"
            ? "bg-rosevia-rose-dark/85 border-rosevia-rose-light/40"
            : theme === "Polished Obsidian"
            ? "bg-neutral-950/80 border-neutral-800"
            : theme === "Liquid Gold Premium"
            ? "bg-[#111C18]/85 border-rosevia-gold/50"
            : "bg-[#111C18]/80 border-rosevia-rose/25"
        }`}>
          <div className="flex items-center space-x-3">
            <button 
              onClick={handlePrevWeek}
              className="p-2 rounded-xl bg-rosevia-cream border border-rosevia-rose/20 text-rosevia-clay hover:text-rosevia-gold hover:border-rosevia-gold/45 cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <span className={`text-sm font-bold font-sans select-all ${
              theme === "Rose Quartz Luxury" || theme === "Polished Obsidian" || theme === "Liquid Gold Premium"
                ? "text-rosevia-cream"
                : "text-rosevia-charcoal"
            }`}>
              {getFormattedWeekRange()}
            </span>
            <button 
              onClick={handleNextWeek}
              className="p-2 rounded-xl bg-rosevia-cream border border-rosevia-rose/20 text-rosevia-clay hover:text-rosevia-gold hover:border-rosevia-gold/45 cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <button 
            onClick={() => {
              setEventDate(new Date().toISOString().split("T")[0]);
              setShowEventModal(true);
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer shadow flex items-center gap-1.5 transform hover:-translate-y-0.5 transition-all duration-300 ${currentTheme.button}`}
          >
            <Plus size={14} className="stroke-[3]" /> Schedule Event
          </button>
        </div>

        {/* Calendar Weekly Grid */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-stretch">
          {weekDays.map((day) => {
            const dayNameLower = day.name;
            const amRoutine = routine?.weeklyCycle?.[dayNameLower]?.am || [];
            const pmRoutine = routine?.weeklyCycle?.[dayNameLower]?.pm || [];
            
            const dayEvents = events.filter(e => e.eventDate === day.formatted);

            const isToday = new Date().toISOString().split("T")[0] === day.formatted;

            const getDayCardClass = () => {
              if (isToday) {
                switch (theme) {
                  case "Rose Quartz Luxury": return "bg-rosevia-rose-dark/90 border-rosevia-rosegold shadow-md shadow-rosevia-rosegold/10";
                  case "Polished Obsidian": return "bg-neutral-950/95 border-rosevia-gold shadow-md shadow-rosevia-gold/15";
                  case "Liquid Gold Premium": return "bg-[#111C18]/95 border-rosevia-gold shadow-md shadow-rosevia-gold/10";
                  case "Midnight Jade":
                  default: return "bg-rosevia-sand/90 border-rosevia-gold shadow-md shadow-rosevia-gold/5";
                }
              } else {
                switch (theme) {
                  case "Rose Quartz Luxury": return "bg-rosevia-rose-dark/45 border-rosevia-rose-light/20";
                  case "Polished Obsidian": return "bg-neutral-950/30 border-neutral-800";
                  case "Liquid Gold Premium": return "bg-[#111C18]/45 border-rosevia-gold/10";
                  case "Midnight Jade":
                  default: return "bg-rosevia-sand/55 border-rosevia-rose/20";
                }
              }
            };

            const getColHeaderClass = () => {
              if (isToday) {
                switch (theme) {
                  case "Rose Quartz Luxury": return "bg-rosevia-rose-light/40 border-rosevia-rosegold/30";
                  case "Polished Obsidian": return "bg-neutral-900 border-rosevia-gold/40";
                  case "Liquid Gold Premium": return "bg-[#172A23] border-rosevia-gold/50";
                  case "Midnight Jade":
                  default: return "bg-[#172A23] border-rosevia-gold/30";
                }
              } else {
                switch (theme) {
                  case "Rose Quartz Luxury": return "bg-rosevia-rose-dark/95 border-rosevia-rose-light/20";
                  case "Polished Obsidian": return "bg-neutral-950 border-neutral-800";
                  case "Liquid Gold Premium": return "bg-[#111C18] border-rosevia-gold/25";
                  case "Midnight Jade":
                  default: return "bg-[#111C18]/90 border-rosevia-rose/15";
                }
              }
            };

            return (
              <div 
                key={day.name} 
                className={`flex flex-col rounded-2xl border min-h-[380px] transition-all duration-300 ${getDayCardClass()}`}
              >
                {/* Day Header */}
                <div className={`p-3 rounded-t-2xl border-b flex justify-between items-center ${getColHeaderClass()}`}>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${
                    isToday 
                      ? (theme === "Rose Quartz Luxury" ? "text-rosevia-rosegold" : "text-rosevia-gold") 
                      : (theme === "Rose Quartz Luxury" ? "text-rosevia-rose-light" : "text-rosevia-clay/80")
                  }`}>
                    {day.name.substring(0, 3)}
                  </span>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isToday 
                      ? "bg-rosevia-gold text-rosevia-cream" 
                      : (theme === "Rose Quartz Luxury" || theme === "Polished Obsidian" || theme === "Liquid Gold Premium"
                          ? "text-rosevia-cream"
                          : "text-rosevia-charcoal")
                  }`}>
                    {day.dayNumber}
                  </span>
                </div>

                {/* Day Body Content */}
                <div className="p-3 flex-1 flex flex-col space-y-4">
                  
                  {/* Quick Schedule AM/PM Buttons */}
                  {amRoutine.length > 0 && !dayEvents.some(e => e.title === "AM Routine") && (
                    <button
                      onClick={() => quickScheduleRoutine(day.formatted, "am")}
                      className="py-2 px-2.5 rounded-xl border border-rosevia-gold/30 hover:border-rosevia-gold hover:bg-rosevia-rose/10 transition-all text-[9px] font-bold text-rosevia-gold uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                    >
                      ☀️ Schedule AM Routine
                    </button>
                  )}

                  {pmRoutine.length > 0 && !dayEvents.some(e => e.title === "PM Routine") && (
                    <button
                      onClick={() => quickScheduleRoutine(day.formatted, "pm")}
                      className="py-2 px-2.5 rounded-xl border border-rosevia-clay/30 hover:border-rosevia-clay hover:bg-rosevia-rose/10 transition-all text-[9px] font-bold text-rosevia-clay uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                    >
                      🌙 Schedule PM Routine
                    </button>
                  )}

                  {/* Custom scheduled events block */}
                  {dayEvents.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-rosevia-rose/10">
                      <span className="text-[7.5px] font-bold text-rosevia-clay/50 uppercase tracking-widest block">
                        Teams Calendar Events
                      </span>
                      {dayEvents.map((evt) => (
                        <div 
                          key={evt.id} 
                          className={`p-2 rounded-xl border text-[10px] font-sans flex flex-col justify-between relative group transition-all duration-300 ${getEventCategoryStyle(evt.category)} ${
                            evt.completed ? "opacity-50 line-through" : ""
                          }`}
                        >
                          <div className="flex justify-between items-start gap-1">
                            <button
                              onClick={() => toggleEventComplete(evt)}
                              className="flex items-center text-left truncate min-w-0"
                            >
                              <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 mr-1.5 transition-all ${
                                evt.completed 
                                  ? "bg-rosevia-gold border-rosevia-gold text-rosevia-cream" 
                                  : "border-rosevia-rose/40 bg-rosevia-cream"
                              }`}>
                                {evt.completed && <Check size={8} className="stroke-[3]" />}
                              </div>
                              <span className="font-bold truncate leading-tight">{evt.title}</span>
                            </button>
                            
                            <button 
                              onClick={() => handleDeleteEvent(evt.id)}
                              className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-300 transition-opacity p-0.5"
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>

                          <div className="flex items-center space-x-1 text-[8px] opacity-75 mt-1.5">
                            <Clock size={8} /> 
                            <span>{evt.startTime} - {evt.endTime}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Day Quick Scheduler hover button */}
                  <button 
                    onClick={() => {
                      setEventDate(day.formatted);
                      setShowEventModal(true);
                    }}
                    className="w-full py-1.5 rounded-xl border border-dashed border-rosevia-rose/25 text-[8px] font-bold text-rosevia-clay hover:text-rosevia-gold hover:border-rosevia-gold/50 hover:bg-rosevia-cream transition-all uppercase tracking-wider cursor-pointer mt-auto flex items-center justify-center gap-1 opacity-40 hover:opacity-100"
                  >
                    <Plus size={8} /> Add Event
                  </button>

                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Teams-style Event Scheduler Form Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl relative shadow-xl space-y-4">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-rosevia-rose/20 pb-3">
              <div className="flex items-center space-x-2">
                <Calendar size={16} className="text-rosevia-gold" />
                <h3 className="text-xs font-bold tracking-widest uppercase text-rosevia-charcoal">Schedule Skincare Event</h3>
              </div>
              <button 
                onClick={() => setShowEventModal(false)}
                className="text-rosevia-clay hover:text-rosevia-gold transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Event Form */}
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-rosevia-clay/70 font-bold uppercase block">Event Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Clay Mask, Chemical Peel, Laser Appointment"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full bg-rosevia-sand border border-rosevia-rose/30 rounded-xl px-3 py-2.5 text-xs text-rosevia-charcoal font-semibold focus:outline-none focus:border-rosevia-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-rosevia-clay/70 font-bold uppercase block">Date</label>
                  <input 
                    type="date" 
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full bg-rosevia-sand border border-rosevia-rose/30 rounded-xl px-3 py-2 text-xs text-rosevia-charcoal font-semibold focus:outline-none focus:border-rosevia-gold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-rosevia-clay/70 font-bold uppercase block">Category</label>
                  <select 
                    value={eventCategory}
                    onChange={(e) => setEventCategory(e.target.value)}
                    className="w-full bg-rosevia-sand border border-rosevia-rose/30 rounded-xl px-3 py-2 text-xs text-rosevia-charcoal font-semibold focus:outline-none focus:border-rosevia-gold cursor-pointer"
                  >
                    <option value="Treatment">Treatment</option>
                    <option value="Mask">Sheet/Clay Mask</option>
                    <option value="Exfoliation">Exfoliation</option>
                    <option value="Consultation">Consultation</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-rosevia-clay/70 font-bold uppercase block">Start Time</label>
                  <input 
                    type="time" 
                    value={eventStartTime}
                    onChange={(e) => setEventStartTime(e.target.value)}
                    className="w-full bg-rosevia-sand border border-rosevia-rose/30 rounded-xl px-3 py-2 text-xs text-rosevia-charcoal font-semibold focus:outline-none focus:border-rosevia-gold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-rosevia-clay/70 font-bold uppercase block">End Time</label>
                  <input 
                    type="time" 
                    value={eventEndTime}
                    onChange={(e) => setEventEndTime(e.target.value)}
                    className="w-full bg-rosevia-sand border border-rosevia-rose/30 rounded-xl px-3 py-2 text-xs text-rosevia-charcoal font-semibold focus:outline-none focus:border-rosevia-gold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-rosevia-clay/70 font-bold uppercase block">Event Notes</label>
                <textarea 
                  placeholder="Notes, chemical concentrations, prep details..."
                  value={eventNotes}
                  onChange={(e) => setEventNotes(e.target.value)}
                  className="w-full h-16 bg-rosevia-sand border border-rosevia-rose/30 rounded-xl p-3 text-xs text-rosevia-charcoal font-semibold focus:outline-none focus:border-rosevia-gold resize-none"
                />
              </div>

              <button
                type="submit"
                className={`w-full py-3.5 rounded-xl text-rosevia-cream text-xs tracking-widest font-bold uppercase shadow hover:shadow-md transition-all duration-300 cursor-pointer flex items-center justify-center transform hover:-translate-y-0.5 ${currentTheme.button}`}
              >
                Schedule Event <Sparkles size={12} className="ml-1.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FLOATING BOTTOM PREMIUM NAVIGATION DOCK (BALANCED FOR 7 ITEMS) */}
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
          className="flex flex-col items-center text-rosevia-clay hover:text-rosevia-gold shrink-0 cursor-pointer"
        >
          <AlertCircle size={18} />
          <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">Checker</span>
        </button>
        <button 
          onClick={() => navigateTo("/calendar")}
          className="flex flex-col items-center text-rosevia-gold shrink-0 cursor-pointer animate-none"
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
