"use client";

import { useState } from "react";
import { useRouter } from "next/router";
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
  const [loading, setLoading] = useState(false);

  // Next.js App Router navigation
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
        // Save quiz profile and routine in local storage to keep state across client pages
        localStorage.setItem("rosevia_profile", JSON.stringify({
          skinType,
          concerns,
          climate,
          age,
          experience
        }));
        localStorage.setItem("rosevia_routine", JSON.stringify(data.routine));
        handleRedirect();
      }
    } catch (error) {
      console.error("Failed to generate skincare routine:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalSteps = 4;

  return (
    <div className="min-height-screen bg-rosevia-cream text-rosevia-charcoal flex flex-col items-center justify-center p-4 md:p-8 select-none">
      {/* Premium Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-serif tracking-widest text-rosevia-clay uppercase">
          Rosevia
        </h1>
        <p className="text-xs tracking-widest text-rosevia-gold uppercase mt-1">
          Dermatological Profile Builder
        </p>
      </div>

      <div className="w-full max-w-xl glass-card p-6 md:p-8 flex flex-col relative overflow-hidden">
        {/* Step Progress Line */}
        {!loading && (
          <div className="flex items-center justify-between mb-8">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className="flex-1 flex items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all duration-300 font-medium ${
                    step > i + 1 
                      ? "bg-rosevia-rose text-rosevia-cream"
                      : step === i + 1
                      ? "bg-rosevia-gold text-rosevia-cream ring-4 ring-rosevia-rose/20"
                      : "bg-white text-rosevia-clay/60 border border-rosevia-rose/30"
                  }`}
                >
                  {step > i + 1 ? <Check size={14} /> : i + 1}
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
                <Sparkles size={32} className="text-rosevia-gold animate-spin duration-3000" />
              </div>
              <Loader2 size={48} className="text-rosevia-rose animate-spin absolute -top-3 -right-3" />
            </div>
            <h2 className="text-xl md:text-2xl font-serif text-rosevia-clay mb-2">
              Formulating Your Botanical & Clinical Cycle...
            </h2>
            <p className="text-sm text-rosevia-clay/70 max-w-sm">
              Our AI cosmetician is layering active complexes and scheduling rest days based on your skin metrics.
            </p>
          </div>
        ) : (
          /* Multi-Step Forms */
          <div className="flex-1 flex flex-col justify-between">
            {/* Step 1: Skin Type */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center md:text-left">
                  <h2 className="text-xl md:text-2xl font-serif text-rosevia-clay">
                    Describe your skin's primary nature.
                  </h2>
                  <p className="text-xs text-rosevia-clay/60 mt-1">
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
                      className={`flex items-start text-left p-4 rounded-xl transition-all duration-300 ${
                        skinType === item.id 
                          ? "bg-rosevia-rose/25 border-2 border-rosevia-gold shadow-sm"
                          : "bg-white border border-rosevia-rose/20 hover:border-rosevia-rose/50"
                      }`}
                    >
                      <item.icon size={20} className={`mt-0.5 mr-3 shrink-0 ${skinType === item.id ? "text-rosevia-gold" : "text-rosevia-clay/55"}`} />
                      <div>
                        <p className="font-medium text-sm">{item.label}</p>
                        <p className="text-xs text-rosevia-clay/75 mt-0.5">{item.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Main Concerns */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center md:text-left">
                  <h2 className="text-xl md:text-2xl font-serif text-rosevia-clay">
                    Identify your primary skin goals.
                  </h2>
                  <p className="text-xs text-rosevia-clay/60 mt-1">
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
                        className={`flex items-start text-left p-4 rounded-xl transition-all duration-300 ${
                          isSelected 
                            ? "bg-rosevia-rose/25 border-2 border-rosevia-gold shadow-sm"
                            : "bg-white border border-rosevia-rose/20 hover:border-rosevia-rose/50"
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center mt-0.5 mr-3 shrink-0 transition-all ${
                          isSelected ? "bg-rosevia-gold border-rosevia-gold text-white" : "border-rosevia-rose/50 bg-white"
                        }`}>
                          {isSelected && <Check size={12} />}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{item.label}</p>
                          <p className="text-xs text-rosevia-clay/75 mt-0.5">{item.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Climate */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center md:text-left">
                  <h2 className="text-xl md:text-2xl font-serif text-rosevia-clay">
                    Describe your environmental climate.
                  </h2>
                  <p className="text-xs text-rosevia-clay/60 mt-1">
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
                      className={`flex items-start text-left p-4 rounded-xl transition-all duration-300 ${
                        climate === item.id 
                          ? "bg-rosevia-rose/25 border-2 border-rosevia-gold shadow-sm"
                          : "bg-white border border-rosevia-rose/20 hover:border-rosevia-rose/50"
                      }`}
                    >
                      <item.icon size={20} className={`mt-0.5 mr-3 shrink-0 ${climate === item.id ? "text-rosevia-gold" : "text-rosevia-clay/55"}`} />
                      <div>
                        <p className="font-medium text-sm">{item.label}</p>
                        <p className="text-xs text-rosevia-clay/75 mt-0.5">{item.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Age & Experience */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="text-center md:text-left">
                  <h2 className="text-xl md:text-2xl font-serif text-rosevia-clay">
                    Nearly finished...
                  </h2>
                  <p className="text-xs text-rosevia-clay/60 mt-1">
                    Provide your age group and experience to gauge active chemical tolerance.
                  </p>
                </div>

                <div className="space-y-5 py-2">
                  {/* Age Group Selector */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold tracking-wide uppercase text-rosevia-clay/70">Age Range</p>
                    <div className="grid grid-cols-3 gap-2">
                      {["Under 25", "25-39", "40+"].map((item) => (
                        <button
                          key={item}
                          onClick={() => setAge(item)}
                          className={`py-3 px-2 rounded-lg text-xs font-medium border text-center transition-all ${
                            age === item 
                              ? "bg-rosevia-rose/30 border-rosevia-gold text-rosevia-charcoal font-semibold shadow-sm"
                              : "bg-white border-rosevia-rose/20 hover:border-rosevia-rose/50"
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Active Skincare Experience */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold tracking-wide uppercase text-rosevia-clay/70">Routine Familiarity</p>
                    <div className="grid grid-cols-3 gap-2">
                      {["Beginner", "Intermediate", "Advanced"].map((item) => (
                        <button
                          key={item}
                          onClick={() => setExperience(item)}
                          className={`py-3 px-2 rounded-lg text-xs font-medium border text-center transition-all ${
                            experience === item 
                              ? "bg-rosevia-rose/30 border-rosevia-gold text-rosevia-charcoal font-semibold shadow-sm"
                              : "bg-white border-rosevia-rose/20 hover:border-rosevia-rose/50"
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
                  className="flex items-center text-xs tracking-wider uppercase font-semibold text-rosevia-clay hover:text-rosevia-charcoal transition-all"
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
                    (step === 1 && !skinType) ||
                    (step === 2 && concerns.length === 0) ||
                    (step === 3 && !climate)
                  }
                  className="flex items-center px-5 py-3 rounded-lg text-xs tracking-wider uppercase font-semibold bg-rosevia-clay text-rosevia-cream hover:bg-rosevia-charcoal transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Continue <ArrowRight size={14} className="ml-1.5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!age || !experience}
                  className="flex items-center px-6 py-3.5 rounded-lg text-xs tracking-widest uppercase font-semibold bg-rosevia-gold text-rosevia-cream hover:bg-rosevia-clay transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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
