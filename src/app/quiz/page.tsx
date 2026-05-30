"use client";

import { useState, useEffect } from "react";
import { 
  Sparkles, 
  Droplet, 
  Flame, 
  ShieldAlert, 
  Wind, 
  Sun, 
  CloudRain, 
  Check, 
  ArrowRight, 
  ChevronLeft,
  Loader2
} from "lucide-react";

export default function SkinQuiz() {
  const [step, setStep] = useState(1);
  const [skinType, setSkinType] = useState("");
  const [concerns, setConcerns] = useState<string[]>([]);
  const [climate, setClimate] = useState("");
  const [age, setAge] = useState("");
  const [experience, setExperience] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState("Midnight Jade");

  useEffect(() => {
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

  const handleRedirect = () => {
    window.location.href = "/";
  };

  const handleConcernToggle = (concern: string) => {
    if (concerns.includes(concern)) {
      setConcerns(concerns.filter((c) => c !== concern));
    } else {
      setConcerns([...concerns, concern]);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let userId = localStorage.getItem("rosevia_user_id");
      if (!userId) {
        userId = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem("rosevia_user_id", userId);
      }

      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "quiz",
          skinType,
          concerns,
          climate,
          age,
          experience
        })
      });
      const data = await response.json();
      
      if (data.routine) {
        const profileData = {
          name: name.trim() || "User",
          email: email.trim() || "",
          streak: 0,
          skinType,
          concerns,
          climate,
          age,
          experience
        };

        localStorage.setItem("rosevia_profile", JSON.stringify(profileData));
        localStorage.setItem("rosevia_routine", JSON.stringify(data.routine));

        // Save profile and routine to database with isolated userId
        await fetch("/api/db", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "save_profile",
            userId,
            profile: profileData
          })
        });

        await fetch("/api/db", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "save_routine",
            userId,
            routine: data.routine
          })
        });

        handleRedirect();
      }
    } catch (error) {
      console.error("Failed to generate skincare routine:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalSteps = 5;

  return (
    <div className={`min-h-screen ${currentTheme.bg} flex flex-col items-center justify-center p-4 md:p-8 select-none transition-colors duration-500`}>
      {/* Premium Header */}
      <div className="text-center mb-8">
        <h1 className={`text-3xl md:text-4xl font-serif tracking-widest ${currentTheme.gold} uppercase font-bold`}>
          Rosevia
        </h1>
        <p className={`text-xs tracking-widest ${currentTheme.accent} uppercase mt-1 font-bold`}>
          Dermatological Profile Builder
        </p>
      </div>

      <div className={`w-full max-w-xl ${currentTheme.card} p-6 md:p-8 flex flex-col relative overflow-hidden`}>
        {/* Step Progress Line */}
        {!loading && (
          <div className="flex items-center justify-between mb-8">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className="flex-1 flex items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all duration-300 font-bold ${
                    step > i + 1 
                      ? "bg-rosevia-rose text-rosevia-cream"
                      : step === i + 1
                      ? "bg-rosevia-gold text-rosevia-cream ring-4 ring-rosevia-rose/20"
                      : "bg-rosevia-cream/80 text-rosevia-clay/60 border border-rosevia-rose/30"
                  }`}
                >
                  {step > i + 1 ? <Check size={14} className="stroke-[3]" /> : i + 1}
                </div>
                {i < totalSteps - 1 && (
                  <div 
                    className={`flex-1 h-0.5 mx-2 transition-all duration-500 ${
                      step > i + 1 ? "bg-rosevia-rose" : "bg-rosevia-rose/20"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {loading ? (
          /* Premium Generating State */
          <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-full bg-rosevia-rose/10 flex items-center justify-center animate-pulse-ring">
                <Sparkles size={32} className={`${currentTheme.gold} animate-spin duration-3000`} />
              </div>
              <Loader2 size={48} className={`${currentTheme.gold} animate-spin absolute -top-3 -right-3`} />
            </div>
            <h2 className={`text-xl md:text-2xl font-serif ${currentTheme.gold} mb-2`}>
              Formulating Your Botanical & Clinical Cycle...
            </h2>
            <p className={`text-xs ${currentTheme.accent} max-w-sm font-semibold`}>
              Our AI cosmetician is layering active complexes and scheduling rest days based on your skin metrics.
            </p>
          </div>
        ) : (
          /* Multi-Step Forms */
          <div className="flex-1 flex flex-col justify-between">
            {/* Step 1: User Name & Email */}
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center md:text-left">
                  <h2 className={`text-xl md:text-2xl font-serif ${currentTheme.gold}`}>
                    Welcome to Rosevia. Introduce yourself.
                  </h2>
                  <p className={`text-xs ${currentTheme.accent} mt-1 font-semibold`}>
                    We will personalize your clinical skincare routine, daily diary, and sync settings.
                  </p>
                </div>
                <div className="space-y-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-rosevia-clay/70 font-bold uppercase block">Your Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name..."
                      className="w-full bg-rosevia-sand border border-rosevia-rose/30 rounded-xl p-4 text-sm focus:ring-1 focus:ring-rosevia-gold focus:outline-none placeholder-rosevia-clay/40 font-semibold text-rosevia-charcoal shadow-inner"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-rosevia-clay/70 font-bold uppercase block">Your Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email..."
                      className="w-full bg-rosevia-sand border border-rosevia-rose/30 rounded-xl p-4 text-sm focus:ring-1 focus:ring-rosevia-gold focus:outline-none placeholder-rosevia-clay/40 font-semibold text-rosevia-charcoal shadow-inner"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Skin Type */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center md:text-left">
                  <h2 className={`text-xl md:text-2xl font-serif ${currentTheme.gold}`}>
                    Describe your skin's primary nature.
                  </h2>
                  <p className={`text-xs ${currentTheme.accent} mt-1 font-semibold`}>
                    Select the option that best describes your baseline skin behavior.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {[
                    { id: "Dry", label: "Dry", desc: "Feels tight, flakey, needs rich hydration", icon: Droplet },
                    { id: "Oily", label: "Oily", desc: "Excess shine, enlarged pores, prone to congestion", icon: Flame },
                    { id: "Combination", label: "Combination", desc: "Shiny T-zone, dry cheeks, unbalanced", icon: Sparkles },
                    { id: "Sensitive", label: "Sensitive", desc: "Prone to redness, burning, barrier reactivity", icon: ShieldAlert },
                    { id: "Normal", label: "Normal", desc: "Relatively balanced moisture levels and texture", icon: Check }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSkinType(item.id)}
                      className={`flex items-start text-left p-4 rounded-xl transition-all duration-300 cursor-pointer ${
                        skinType === item.id 
                          ? "bg-rosevia-rose/20 border-2 border-rosevia-gold shadow-sm"
                          : "bg-rosevia-cream/80 border border-rosevia-rose/20 hover:border-rosevia-rose/50"
                      }`}
                    >
                      <item.icon size={20} className={`mt-0.5 mr-3 shrink-0 ${skinType === item.id ? `${currentTheme.gold} animate-pulse` : "text-rosevia-clay/55"}`} />
                      <div>
                        <p className="font-bold text-sm text-rosevia-charcoal">{item.label}</p>
                        <p className="text-xs text-rosevia-clay mt-0.5 font-semibold leading-relaxed">{item.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Main Concerns */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center md:text-left">
                  <h2 className={`text-xl md:text-2xl font-serif ${currentTheme.gold}`}>
                    Identify your primary skin goals.
                  </h2>
                  <p className={`text-xs ${currentTheme.accent} mt-1 font-semibold`}>
                    What changes are you looking to target with your active cycle? (Select all that apply)
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {[
                    { id: "Acne", label: "Clear Congestion", desc: "Blackheads, hormonal breakouts, micro-comedones" },
                    { id: "Fine Lines", label: "Support Aging", desc: "Fine lines, static wrinkles, loss of elasticity" },
                    { id: "Hyperpigmentation", label: "Brighten Spots", desc: "Sun damage, post-acne dark marks, uneven melasma" },
                    { id: "Redness", label: "Calm Inflammation", desc: "Persistent vascular redness, heat flareups, irritation" },
                    { id: "Texture", label: "Refine Texture", desc: "Flakeyness, bumpy skin, rough stratum corneum surface" }
                  ].map((item) => {
                    const isSelected = concerns.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleConcernToggle(item.id)}
                        className={`flex items-start text-left p-4 rounded-xl transition-all duration-300 cursor-pointer ${
                          isSelected 
                            ? "bg-rosevia-rose/20 border-2 border-rosevia-gold shadow-sm"
                            : "bg-rosevia-cream/80 border border-rosevia-rose/20 hover:border-rosevia-rose/50"
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center mt-0.5 mr-3 shrink-0 transition-all ${
                          isSelected ? "bg-rosevia-gold border-rosevia-gold text-rosevia-cream" : "border-rosevia-rose/50 bg-rosevia-cream"
                        }`}>
                          {isSelected && <Check size={12} className="stroke-[3]" />}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-rosevia-charcoal">{item.label}</p>
                          <p className="text-xs text-rosevia-clay mt-0.5 font-semibold leading-relaxed">{item.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 4: Climate */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="text-center md:text-left">
                  <h2 className={`text-xl md:text-2xl font-serif ${currentTheme.gold}`}>
                    Describe your environmental climate.
                  </h2>
                  <p className={`text-xs ${currentTheme.accent} mt-1 font-semibold`}>
                    Your skin's moisture evaporation rate highly correlates with weather metrics!
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {[
                    { id: "Dry & Cold", label: "Dry & Cold", desc: "High water loss, low relative humidity, freezing winds", icon: Wind },
                    { id: "Hot & Humid", label: "Hot & Humid", desc: "Active sebaceous glands, sweaty conditions, clogged pores", icon: CloudRain },
                    { id: "Moderate", label: "Moderate & Seasonal", desc: "Temperate conditions, balanced moisture profiles", icon: Sun },
                    { id: "Polluted", label: "Urban & Polluted", desc: "High particulate matter, ozone exposure, oxidation stress", icon: ShieldAlert }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setClimate(item.id)}
                      className={`flex items-start text-left p-4 rounded-xl transition-all duration-300 cursor-pointer ${
                        climate === item.id 
                          ? "bg-rosevia-rose/20 border-2 border-rosevia-gold shadow-sm"
                          : "bg-rosevia-cream/80 border border-rosevia-rose/20 hover:border-rosevia-rose/50"
                      }`}
                    >
                      <item.icon size={20} className={`mt-0.5 mr-3 shrink-0 ${climate === item.id ? `${currentTheme.gold} animate-pulse` : "text-rosevia-clay/55"}`} />
                      <div>
                        <p className="font-bold text-sm text-rosevia-charcoal">{item.label}</p>
                        <p className="text-xs text-rosevia-clay mt-0.5 font-semibold leading-relaxed">{item.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Age & Experience */}
            {step === 5 && (
              <div className="space-y-6">
                <div className="text-center md:text-left">
                  <h2 className={`text-xl md:text-2xl font-serif ${currentTheme.gold}`}>
                    Nearly finished...
                  </h2>
                  <p className={`text-xs ${currentTheme.accent} mt-1 font-semibold`}>
                    Provide your age group and experience to gauge active chemical tolerance.
                  </p>
                </div>

                <div className="space-y-5 py-2">
                  {/* Age Group Selector */}
                  <div className="space-y-2">
                    <p className={`text-xs font-semibold tracking-wide uppercase ${currentTheme.accent} opacity-80`}>Age Range</p>
                    <div className="grid grid-cols-3 gap-2">
                      {["Under 25", "25-39", "40+"].map((item) => (
                        <button
                          key={item}
                          onClick={() => setAge(item)}
                          className={`py-3 px-2 rounded-lg text-xs font-bold border text-center transition-all cursor-pointer ${
                            age === item 
                              ? "bg-rosevia-rose/25 border-rosevia-gold text-rosevia-charcoal shadow-sm"
                              : "bg-rosevia-cream/80 border border-rosevia-rose/20 hover:border-rosevia-rose/50"
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Active Skincare Experience */}
                  <div className="space-y-2">
                    <p className={`text-xs font-semibold tracking-wide uppercase ${currentTheme.accent} opacity-80`}>Routine Familiarity</p>
                    <div className="grid grid-cols-3 gap-2">
                      {["Beginner", "Intermediate", "Advanced"].map((item) => (
                        <button
                          key={item}
                          onClick={() => setExperience(item)}
                          className={`py-3 px-2 rounded-lg text-xs font-bold border text-center transition-all cursor-pointer ${
                            experience === item 
                              ? "bg-rosevia-rose/25 border-rosevia-gold text-rosevia-charcoal shadow-sm"
                              : "bg-rosevia-cream/80 border border-rosevia-rose/20 hover:border-rosevia-rose/50"
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Actions */}
            <div className="flex items-center justify-between border-t border-rosevia-rose/20 pt-6 mt-8">
              {step > 1 ? (
                <button
                  onClick={() => setStep(step - 1)}
                  className={`flex items-center text-xs tracking-wider uppercase font-bold ${currentTheme.accent} hover:${currentTheme.gold} transition-all cursor-pointer`}
                >
                  <ChevronLeft size={16} className="mr-1" /> Back
                </button>
              ) : (
                <div />
              )}

              {step < totalSteps ? (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={
                    (step === 1 && (!name.trim() || !email.trim() || !email.includes("@"))) ||
                    (step === 2 && !skinType) ||
                    (step === 3 && concerns.length === 0) ||
                    (step === 4 && !climate)
                  }
                  className="flex items-center px-5 py-3 rounded-lg text-xs tracking-wider uppercase font-bold bg-rosevia-clay text-rosevia-cream hover:bg-rosevia-gold hover:text-rosevia-cream transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow"
                >
                  Continue <ArrowRight size={14} className="ml-1.5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!age || !experience}
                  className={`flex items-center px-6 py-3.5 rounded-lg text-xs tracking-widest uppercase font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md ${currentTheme.button}`}
                >
                  Create My Cycle <Sparkles size={14} className="ml-2" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
