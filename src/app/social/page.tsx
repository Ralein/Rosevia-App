"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  Layers, 
  Activity, 
  FolderHeart, 
  AlertCircle, 
  MessageSquareHeart, 
  BookOpen,
  Flame,
  Award,
  Sparkles,
  Heart,
  Filter,
  CheckCircle,
  ThumbsUp
} from "lucide-react";
import confetti from "canvas-confetti";

interface Friend {
  id: string;
  name: string;
  avatar: string;
  skinType: string;
  streak: number;
  lastActive: string;
}

interface Review {
  id: string;
  author: string;
  skinType: string;
  productName: string;
  rating: number;
  text: string;
  likes: number;
}

export default function SocialFeed() {
  const [profile, setProfile] = useState<any>(null);
  const [filterActive, setFilterActive] = useState(false);
  const [cheeredFriends, setCheeredFriends] = useState<string[]>([]);

  const navigateTo = (path: string) => {
    window.location.href = path;
  };

  useEffect(() => {
    const savedProfile = localStorage.getItem("rosevia_profile");
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    } else {
      setProfile({ skinType: "Combination", concerns: ["Acne"] });
    }
  }, []);

  const friends: Friend[] = [
    { id: "fr-1", name: "Charlotte Vance", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop", skinType: "Dry", streak: 18, lastActive: "10m ago" },
    { id: "fr-2", name: "Sienna Miller", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop", skinType: "Sensitive", streak: 12, lastActive: "1h ago" },
    { id: "fr-3", name: "Oliver Brooks", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop", skinType: "Oily", streak: 8, lastActive: "4h ago" }
  ];

  const communityReviews: Review[] = [
    { id: "rev-1", author: "GlowGetter_88", skinType: "Oily", productName: "Paula's Choice 2% BHA Liquid Exfoliant", rating: 5, text: "Unbelievable pore congestion control. I used to get major afternoon sebum shine on my forehead, but after 3 weeks of strict Tuesday/Friday PM cycles, my skin is smooth and flat. Zero oily breakouts since!", likes: 24 },
    { id: "rev-2", author: "RosaceaSafe_Lover", skinType: "Sensitive", productName: "CeraVe Hydrating Facial Cleanser", rating: 5, text: "A absolute holy grail if you suffer from severe micro-redness or compromised barriers like me. It doesn't strip or soap up, leaving a comforting humectant lock behind. Extremely calming Cica cream layers absorb so easily after.", likes: 45 },
    { id: "rev-3", author: "CellularRenewal_Prone", skinType: "Dry", productName: "The Ordinary Hyaluronic Acid 2% + B5", rating: 4, text: "It's quite thick and can pill if you apply to dry skin. Pro-tip: Leave your skin soaking wet first, tap this on, wait 2 minutes, and follow immediately with ceramide double repair cream. Extinguishes dry scales completely!", likes: 18 },
    { id: "rev-4", author: "SkinSage_Charlotte", skinType: "Dry", productName: "SkinCeuticals C E Ferulic Serum", rating: 5, text: "Expensive, but completely erased my post-acne dark marks and hyperpigmentation within 2 months! Pairs beautifully under sunscreen, making skin incredibly plump and radiant. Smells slightly like hot dog water but works miracles.", likes: 32 }
  ];

  const handleCheerFriend = (id: string) => {
    if (cheeredFriends.includes(id)) return;
    setCheeredFriends([...cheeredFriends, id]);
    
    // Trigger fun reward micro-confetti
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.75 },
      colors: ["#C5A880", "#EAD2C6", "#FAF7F2"]
    });
  };

  // Filter reviews strictly based on user's local skinType
  const filteredReviews = filterActive && profile
    ? communityReviews.filter((r) => r.skinType.toLowerCase() === profile.skinType.toLowerCase())
    : communityReviews;

  return (
    <div className="min-h-screen bg-rosevia-cream text-rosevia-charcoal pb-28 select-none">
      
      <div className="max-w-4xl mx-auto px-4 pt-6 md:pt-10 flex flex-col space-y-6 animate-fade-in">
        
        {/* Header Title */}
        <header className="flex justify-between items-start">
          <div>
            <h1 className="text-xs tracking-widest font-bold text-rosevia-clay uppercase">Consistency Communities</h1>
            <p className="text-2xl md:text-3xl font-serif text-rosevia-charcoal tracking-tight font-light mt-1">
              Accountability & <span className="italic text-rosevia-clay font-normal">Friend Streaks</span>
            </p>
          </div>
          <div className="px-3 py-1 bg-rosevia-gold/15 border border-rosevia-gold/30 rounded-full text-[10px] tracking-wider uppercase font-bold text-rosevia-clay shrink-0">
            Community Active
          </div>
        </header>

        {/* Social split grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Friends accountability board on left */}
          <div className="md:col-span-5 glass-card p-5 space-y-4">
            <div className="flex items-center space-x-2">
              <Users size={16} className="text-rosevia-clay" />
              <h3 className="text-xs font-semibold tracking-widest uppercase text-rosevia-clay">Streak accountability</h3>
            </div>
            
            <div className="space-y-3 pt-1">
              {friends.map((fr) => {
                const cheered = cheeredFriends.includes(fr.id);
                return (
                  <div 
                    key={fr.id} 
                    className="flex items-center justify-between bg-white/55 border border-rosevia-rose/15 rounded-xl p-3 hover:border-rosevia-gold/30 transition-all shadow-sm"
                  >
                    <div className="flex items-center space-x-3">
                      <img src={fr.avatar} className="w-10 h-10 rounded-full object-cover border border-rosevia-rose/50" />
                      <div>
                        <p className="text-xs font-bold text-rosevia-charcoal leading-none">{fr.name}</p>
                        <span className="text-[9px] text-rosevia-clay/60 uppercase font-semibold block mt-1 tracking-wider">
                          Skin: {fr.skinType} | Active: {fr.lastActive}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {/* Streak visual */}
                      <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-rosevia-rose/25 text-rosevia-clay text-[10px] font-bold">
                        <Flame size={11} className="text-rosevia-gold fill-rosevia-gold" />
                        <span>{fr.streak}</span>
                      </div>

                      {/* Cheer button */}
                      <button
                        onClick={() => handleCheerFriend(fr.id)}
                        disabled={cheered}
                        className={`text-[9px] font-bold px-2 py-1.5 rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
                          cheered 
                            ? "bg-rosevia-green border border-rosevia-sage/35 text-rosevia-sage font-bold"
                            : "bg-white border border-rosevia-rose/40 text-rosevia-clay hover:bg-rosevia-rose/10"
                        }`}
                      >
                        {cheered ? "Cheered ✓" : "Cheer"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Skin Type Filtered Reviews Column */}
          <div className="md:col-span-7 space-y-4">
            <div className="glass-card p-5 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div className="flex items-center space-x-2">
                  <Filter size={16} className="text-rosevia-clay animate-pulse" />
                  <h3 className="text-xs font-semibold tracking-widest uppercase text-rosevia-clay">Skin-Type Product Reviews</h3>
                </div>

                {/* Filter toggle */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={filterActive} 
                    onChange={(e) => setFilterActive(e.target.checked)} 
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-rosevia-rose/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rosevia-clay"></div>
                  <span className="ml-2 text-[10px] font-bold text-rosevia-clay/85 uppercase">
                    Filter by My Skin Type ({profile?.skinType || "Combination"})
                  </span>
                </label>
              </div>
              <p className="text-[10px] text-rosevia-clay/70 leading-relaxed">
                By activating the skin-type filter, you only see what authentic users with your exact cellular profile experienced. We eliminate sponsored confusion to highlight true efficacy.
              </p>
            </div>

            {/* List of Reviews */}
            <div className="space-y-4">
              {filteredReviews.length === 0 ? (
                <div className="glass-card p-8 text-center flex flex-col items-center justify-center space-y-3 bg-white/30 border border-dashed border-rosevia-rose/40">
                  <AlertCircle size={22} className="text-rosevia-rose" />
                  <p className="text-xs font-semibold text-rosevia-clay">No matching reviews on the shelf</p>
                  <p className="text-[10px] text-rosevia-clay/60">No reviews matching skin type "{profile?.skinType}" are logged yet.</p>
                </div>
              ) : (
                filteredReviews.map((r) => (
                  <div key={r.id} className="glass-card p-5 space-y-3 bg-white/70 border border-rosevia-rose/30 shadow-sm animate-fade-in">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-bold text-rosevia-charcoal">{r.productName}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-[9px] font-bold px-2 py-0.5 bg-rosevia-cream border border-rosevia-rose/25 text-rosevia-clay rounded">
                            Skin: {r.skinType}
                          </span>
                          <span className="text-[9px] text-rosevia-gold font-bold">
                            {"★".repeat(r.rating)}
                          </span>
                        </div>
                      </div>
                      <span className="text-[9px] text-rosevia-clay/60 uppercase font-semibold">@{r.author}</span>
                    </div>

                    <p className="text-xs text-rosevia-clay/90 leading-relaxed font-medium">
                      "{r.text}"
                    </p>

                    <div className="flex items-center justify-between border-t border-rosevia-rose/10 pt-2.5">
                      <span className="text-[9px] text-rosevia-clay/65">Helpful? Cheer this rating!</span>
                      <button className="flex items-center space-x-1.5 text-[9px] font-bold text-rosevia-clay hover:text-rosevia-gold transition-all cursor-pointer">
                        <ThumbsUp size={10} /> <span>{r.likes} Cheers</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

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
          className="flex flex-col items-center text-rosevia-gold shrink-0 cursor-pointer animate-none"
        >
          <Users size={18} />
          <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">Friends</span>
        </button>
      </nav>

    </div>
  );
}
