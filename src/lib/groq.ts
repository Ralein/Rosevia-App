import Groq from "groq-sdk";

// Initialize Groq client only if API key is provided, otherwise fall back to rich simulations
const getGroqClient = () => {
  const apiKey = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    console.warn("Rosevia: GROQ_API_KEY is not defined in .env.local. Operating in high-fidelity simulation fallback mode.");
    return null;
  }
  return new Groq({ apiKey });
};

export const groq = getGroqClient();

// High-fidelity fallback database for mock operations
export const MOCK_SKIN_DATA = {
  // Quiz routines
  routines: {
    oily_acne: {
      routineName: "Clear & Balance Clarifying Cycle",
      focus: "Pore refinement, excess sebum regulation, and active breakout suppression.",
      streak: 0,
      weeklyCycle: {
        monday: { am: ["Cleanser", "Niacinamide Serum", "Moisturizer", "SPF"], pm: ["Cleanser", "Salicylic Acid (BHA) Toner", "Niacinamide Serum", "Moisturizer"] },
        tuesday: { am: ["Cleanser", "Hyaluronic Acid", "Moisturizer", "SPF"], pm: ["Cleanser", "Barrier Repair Cream"] }, // Rest day
        wednesday: { am: ["Cleanser", "Niacinamide Serum", "Moisturizer", "SPF"], pm: ["Cleanser", "Salicylic Acid (BHA) Toner", "Moisturizer"] },
        thursday: { am: ["Cleanser", "Hyaluronic Acid", "Moisturizer", "SPF"], pm: ["Cleanser", "Retinol Serum (0.2%)", "Moisturizer"] },
        friday: { am: ["Cleanser", "Niacinamide Serum", "Moisturizer", "SPF"], pm: ["Cleanser", "Salicylic Acid (BHA) Toner", "Moisturizer"] },
        saturday: { am: ["Cleanser", "Hyaluronic Acid", "Moisturizer", "SPF"], pm: ["Cleanser", "Barrier Repair Cream"] }, // Rest day
        sunday: { am: ["Cleanser", "Hyaluronic Acid", "Moisturizer", "SPF"], pm: ["Cleanser", "Retinol Serum (0.2%)", "Moisturizer"] }
      },
      tips: [
        "Apply Salicylic Acid only on dry skin to avoid irritation.",
        "Wait 3 minutes after applying BHA before sealing with Niacinamide or moisturizer.",
        "Always use your SPF 50 in the morning — BHA and Retinol increase sun sensitivity!"
      ]
    },
    dry_aging: {
      routineName: "Youthful Glow Nourishing Cycle",
      focus: "Deep cellular hydration, epidermal barrier reinforcement, and collagen support.",
      streak: 0,
      weeklyCycle: {
        monday: { am: ["Hydrating Cleanser", "Vitamin C Serum", "Hyaluronic Acid", "Rich Moisturizer", "SPF"], pm: ["Hydrating Cleanser", "Hyaluronic Acid", "Ceramide Cream"] },
        tuesday: { am: ["Hydrating Cleanser", "Hyaluronic Acid", "Rich Moisturizer", "SPF"], pm: ["Hydrating Cleanser", "Retinol Serum (0.5%)", "Rich Moisturizer"] },
        wednesday: { am: ["Hydrating Cleanser", "Vitamin C Serum", "Hyaluronic Acid", "Rich Moisturizer", "SPF"], pm: ["Hydrating Cleanser", "Glycolic Acid (AHA) Toner", "Ceramide Cream"] },
        thursday: { am: ["Hydrating Cleanser", "Hyaluronic Acid", "Rich Moisturizer", "SPF"], pm: ["Hydrating Cleanser", "Retinol Serum (0.5%)", "Rich Moisturizer"] },
        friday: { am: ["Hydrating Cleanser", "Vitamin C Serum", "Hyaluronic Acid", "Rich Moisturizer", "SPF"], pm: ["Hydrating Cleanser", "Hyaluronic Acid", "Ceramide Cream"] },
        saturday: { am: ["Hydrating Cleanser", "Hyaluronic Acid", "Rich Moisturizer", "SPF"], pm: ["Hydrating Cleanser", "Barrier Repair Balm"] }, // Rest day
        sunday: { am: ["Hydrating Cleanser", "Hyaluronic Acid", "Rich Moisturizer", "SPF"], pm: ["Hydrating Cleanser", "Retinol Serum (0.5%)", "Rich Moisturizer"] }
      },
      tips: [
        "Leave your skin slightly damp before applying Hyaluronic Acid to trap maximum water.",
        "Wait 10 minutes after Retinol before layering your rich moisturizers to minimize flaking.",
        "Glycolic Acid exfoliates dead cells to let your hydrating serums absorb twice as effectively."
      ]
    },
    sensitive_redness: {
      routineName: "Soothing Sanctuary Calming Cycle",
      focus: "Barrier restoration, micro-redness reduction, and soothing vascular reactivity.",
      streak: 0,
      weeklyCycle: {
        monday: { am: ["Gentle Cleanser", "Centella Asiatica (Cica) Serum", "Soothing Lotion", "Physical SPF"], pm: ["Gentle Cleanser", "Hyaluronic Acid", "Barrier Repair Cream"] },
        tuesday: { am: ["Gentle Cleanser", "Centella Asiatica (Cica) Serum", "Soothing Lotion", "Physical SPF"], pm: ["Gentle Cleanser", "Niacinamide Serum (5%)", "Barrier Repair Cream"] },
        wednesday: { am: ["Gentle Cleanser", "Hyaluronic Acid", "Soothing Lotion", "Physical SPF"], pm: ["Gentle Cleanser", "Cica Sheet Mask", "Ceramide Cream"] },
        thursday: { am: ["Gentle Cleanser", "Centella Asiatica (Cica) Serum", "Soothing Lotion", "Physical SPF"], pm: ["Gentle Cleanser", "Niacinamide Serum (5%)", "Barrier Repair Cream"] },
        friday: { am: ["Gentle Cleanser", "Centella Asiatica (Cica) Serum", "Soothing Lotion", "Physical SPF"], pm: ["Gentle Cleanser", "Hyaluronic Acid", "Barrier Repair Cream"] },
        saturday: { am: ["Gentle Cleanser", "Hyaluronic Acid", "Soothing Lotion", "Physical SPF"], pm: ["Gentle Cleanser", "Soothing Lotion", "Ceramide Cream"] },
        sunday: { am: ["Gentle Cleanser", "Centella Asiatica (Cica) Serum", "Soothing Lotion", "Physical SPF"], pm: ["Gentle Cleanser", "Niacinamide Serum (5%)", "Barrier Repair Cream"] }
      },
      tips: [
        "Centella Asiatica contains asiaticoside which physically cools skin and shuts down redness signals.",
        "Pat, do not rub, products onto sensitive skin.",
        "Exfoliation is omitted from this cycle to allow your compromised lipid barrier to fully rebuild."
      ]
    }
  },

  // Ingredient conflict records
  conflicts: [
    {
      actives: ["retinol", "glycolic acid"],
      severity: "high",
      badge: "Red Alert (Dangerous)",
      title: "Severe Barrier Impairment Risk",
      description: "Using Retinol (vitamin A derivative) and Glycolic Acid (AHA) in the same routine creates excessive cell turnover. This strips the stratum corneum, causing severe redness, burning, peeling, and contact dermatitis.",
      solution: "Separate them. Use Glycolic Acid in your AM routine (or on alternate PM nights) and reserve Retinol strictly for PM routines on non-exfoliation nights."
    },
    {
      actives: ["retinol", "benzoyl peroxide"],
      severity: "high",
      badge: "Red Alert (Dangerous)",
      title: "Efficacy Mutual Deactivation",
      description: "Benzoyl Peroxide oxidizes Retinol, rendering both completely useless while doubling skin dryness and irritation.",
      solution: "Use Benzoyl Peroxide in the morning as a spot treatment, and Retinol at night. Never apply them together."
    },
    {
      actives: ["vitamin c", "niacinamide"],
      severity: "medium",
      badge: "Yellow Alert (Caution)",
      title: "Potential Skin Flushing",
      description: "When mixed at high temperatures or high concentrations, pure L-Ascorbic Acid (Vitamin C) and Niacinamide can form niacin, which triggers temporary skin flushing and warmth, though it does not damage cells.",
      solution: "Layer Vitamin C first, wait 5 minutes, then apply Niacinamide, or split them (Vitamin C in the morning, Niacinamide at night)."
    },
    {
      actives: ["retinol", "salicylic acid"],
      severity: "high",
      badge: "Red Alert (Dangerous)",
      title: "Dehydration & Peeling Risk",
      description: "Retinol speeds up cell division, while Salicylic Acid (BHA) dissolves the pore lipids. Layering them together strips natural oils, bringing severe irritation and peeling.",
      solution: "Exfoliate with BHA on Tuesdays/Fridays at night, and apply Retinol on other nights (Thursdays/Sundays)."
    },
    {
      actives: ["hyaluronic acid", "retinol"],
      severity: "low",
      badge: "Green Synergy (Excellent)",
      title: "Optimal Hydration Synergy",
      description: "Hyaluronic Acid draws water into cells, while Retinol stimulates collagen. HA acts as a soothing moisture buffer that significantly reduces the dryness and peeling associated with Retinol.",
      solution: "Apply Hyaluronic Acid to damp skin, let it absorb, then follow with Retinol and moisturizer."
    },
    {
      actives: ["niacinamide", "salicylic acid"],
      severity: "low",
      badge: "Green Synergy (Excellent)",
      title: "Acne Fighting Power Couple",
      description: "Salicylic Acid penetrates and clears sebum inside pores, while Niacinamide tightens the pores and calms inflammation. They complement each other beautifully.",
      solution: "Apply BHA first, wait 2 minutes, then apply Niacinamide to soothe and refine."
    }
  ]
};

// 1. QUIZ ROUTINE GENERATION
export async function generateQuizRoutine(quizAnswers: {
  skinType: string;
  concerns: string[];
  climate: string;
  age: string;
  experience: string;
}) {
  const client = getGroqClient();

  if (!client) {
    // Elegant simulated fallback
    let typeKey: keyof typeof MOCK_SKIN_DATA.routines = "oily_acne";
    if (quizAnswers.skinType === "Dry" || quizAnswers.age === "40+") {
      typeKey = "dry_aging";
    } else if (quizAnswers.skinType === "Sensitive" || quizAnswers.concerns.includes("Redness")) {
      typeKey = "sensitive_redness";
    }
    return MOCK_SKIN_DATA.routines[typeKey];
  }

  try {
    const prompt = `You are a professional skincare database AI. Build a highly customized, luxury 7-day skincare routine in JSON format.
User profile:
- Skin Type: ${quizAnswers.skinType}
- Concerns: ${quizAnswers.concerns.join(", ")}
- Climate: ${quizAnswers.climate}
- Age: ${quizAnswers.age}
- Experience: ${quizAnswers.experience}

You MUST return ONLY a valid JSON object matching this TypeScript type structure (no surrounding conversational text, markdown blocks are okay if they are strictly raw JSON):
{
  "routineName": "String (premium luxurious name)",
  "focus": "String (explaining the focus of this routine)",
  "weeklyCycle": {
    "monday": { "am": ["Cleanser", "Product..."], "pm": ["Cleanser", "Product..."] },
    "tuesday": { "am": [...], "pm": [...] },
    "wednesday": { "am": [...], "pm": [...] },
    "thursday": { "am": [...], "pm": [...] },
    "friday": { "am": [...], "pm": [...] },
    "saturday": { "am": [...], "pm": [...] },
    "sunday": { "am": [...], "pm": [...] }
  },
  "tips": ["Tip 1", "Tip 2", "Tip 3"]
}

Rules:
1. Ensure active acids are never scheduled together (e.g., AHA/BHA and Retinol on the same PM routine).
2. Keep it simple: 3-5 steps in AM, 3-5 steps in PM.
3. Suggest premium, clinical product categories rather than branded names (e.g., "Niacinamide Serum" rather than "The Ordinary Niacinamide").`;

    const chatCompletion = await client.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const responseText = chatCompletion.choices[0]?.message?.content || "";
    return JSON.parse(responseText);
  } catch (error) {
    console.error("Groq API error inside generateQuizRoutine, falling back to mock:", error);
    return MOCK_SKIN_DATA.routines.oily_acne;
  }
}

// 2. INGREDIENT CONFLICT CHECKER
export async function checkIngredientConflicts(ingredientsList: string[]) {
  const client = getGroqClient();
  const searchIngredients = ingredientsList.map(i => i.toLowerCase().trim());

  if (!client) {
    // Intelligent simulation logic
    const detectedConflicts = [];
    for (const conflict of MOCK_SKIN_DATA.conflicts) {
      const matches = conflict.actives.every(active => 
        searchIngredients.some(input => input.includes(active))
      );
      if (matches) {
        detectedConflicts.push(conflict);
      }
    }
    
    // If no conflicts detected, do a quick check to see if we have positive synergies or return all clear
    if (detectedConflicts.length === 0) {
      const isHA = searchIngredients.some(i => i.includes("hyaluronic") || i.includes("ha"));
      const isRetinol = searchIngredients.some(i => i.includes("retinol") || i.includes("retinoid"));
      if (isHA && isRetinol) {
        return [MOCK_SKIN_DATA.conflicts[4]]; // Return Green HA+Retinol synergy
      }
      
      const isBHA = searchIngredients.some(i => i.includes("salicylic") || i.includes("bha"));
      const isNiacinamide = searchIngredients.some(i => i.includes("niacinamide"));
      if (isBHA && isNiacinamide) {
        return [MOCK_SKIN_DATA.conflicts[5]]; // Return Green Niacinamide+BHA synergy
      }
    }

    return detectedConflicts;
  }

  try {
    const prompt = `You are a clinical skincare cosmetic chemist. Analyze the following list of active ingredients and identify conflicts or synergies.
Ingredients: ${ingredientsList.join(", ")}

You MUST return ONLY a valid JSON array of objects (no surrounding text, markdown is okay if strictly raw JSON) matching this structure:
[
  {
    "actives": ["ingredient1", "ingredient2"],
    "severity": "high" | "medium" | "low",
    "badge": "String (e.g. Red Alert (Dangerous), Yellow Alert (Caution), Green Synergy (Excellent))",
    "title": "Short title describing the relationship",
    "description": "Scientific explanation of why this conflict or synergy occurs in layperson skincare terms.",
    "solution": "Practical recommendation on how to safely use or separate these ingredients."
  }
]

Include high severity conflicts (like Retinol + AHA, Retinol + Benzoyl Peroxide), medium conflicts (like pure L-Ascorbic Acid + Niacinamide), or low-severity positive synergies (like Hyaluronic Acid + Retinol, Niacinamide + Salicylic Acid) if found in the list. If no conflicts/synergies exist, return an empty array []`;

    const chatCompletion = await client.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const responseText = chatCompletion.choices[0]?.message?.content || "";
    const parsed = JSON.parse(responseText);
    return Array.isArray(parsed) ? parsed : (parsed.conflicts || parsed.results || []);
  } catch (error) {
    console.error("Groq API error inside checkIngredientConflicts, falling back:", error);
    return [];
  }
}

// 3. AI SKIN CHAT DERMATOLOGIST ASSISTANT
export async function chatSkincare(messages: any[], userProfile: {
  skinType: string;
  concerns: string[];
  routineName: string;
  currentStreak: number;
}) {
  const client = getGroqClient();

  if (!client) {
    // Rich simulated conversation engine
    const lastMessage = messages[messages.length - 1]?.content.toLowerCase() || "";
    let responseText = "That's a great question! Skincare is all about patience and scheduling. Could you tell me more about your current routine?";

    if (lastMessage.includes("breakout") || lastMessage.includes("pimple") || lastMessage.includes("acne")) {
      responseText = `I see you're experiencing some breakouts! Based on your **${userProfile.skinType}** skin profile, this could be due to hormonal shifts or pore congestion. 

Since you have **${userProfile.concerns.join(", ")}** listed as active concerns:
1. Try adding a gentle **Salicylic Acid (BHA)** toner twice a week at night.
2. Avoid picking or physical scrubs, which will spread bacteria and worsen redness.
3. Make sure you are maintaining a clean pillowcase and hydration levels to avoid sebaceous overproduction.

Do you currently use an exfoliant in your weekly routine? Let's check if there are any conflicts in your cabinet!`;
    } else if (lastMessage.includes("retinol") || lastMessage.includes("vitamin a")) {
      responseText = `Retinol is the gold standard for cell turnover and skin rejuvenation! However, it needs to be treated with care.

Here are my dermatological rules for your routine:
- **PM Only**: Retinol is highly photosensitive and will degrade in daylight.
- **Dry Skin Application**: Apply it only after your skin has dried completely to minimize deep irritation.
- **Buffering**: If you notice peeling or redness, apply your Hyaluronic Acid first, then moisturizer, wait 5 minutes, and tap on your Retinol. This 'sandwich' method keeps it gentle!

Avoid layering it with AHAs (Glycolic Acid) or BHAs on the same night. Do you have any of these in your active cabinet?`;
    } else if (lastMessage.includes("vitamin c") || lastMessage.includes("spf") || lastMessage.includes("morning")) {
      responseText = `Morning routines are all about protection! Your skin deals with UV rays, pollution, and oxidation during the day.

- **Vitamin C** is a powerful antioxidant that neutralizes free radicals, boosts collagen, and fades dark spots.
- **SPF** is non-negotiable! Vitamin C works three times as effectively when paired under a broad-spectrum SPF 30+.
- Since your current routine is **${userProfile.routineName}**, let's keep Vitamin C in the morning and reserve active acids for the evening to maintain your lipid barrier health.`;
    } else if (lastMessage.includes("dry") || lastMessage.includes("hydration") || lastMessage.includes("moisturizer")) {
      responseText = `For hydration and barrier recovery, we want to target humectants, emollient barriers, and occlusive locks!
      
1. **Humectants** like **Hyaluronic Acid** and **Glycerin** draw moisture into cells. (Pro-tip: Apply to damp skin!).
2. **Emollients** like **Ceramides** physically patch up the cracks in your skin barrier.
3. If your climate is dry, use a heavier cream at night to seal it all in.

Let me know what moisturizers you have, and I can tell you if they contain ceramides or heavy oils that might clog pores!`;
    }

    return {
      role: "assistant",
      content: responseText + "\n\n*(Note: Running in local simulation mode. Plug in a Groq API Key in your .env.local file to unlock fully dynamic, unlimited dermatological chat!)*"
    };
  }

  try {
    const systemPrompt = `You are "Rosevia Derm", a luxury, warm, and highly knowledgeable dermatological AI companion.
You speak like a knowledgeable best friend who is an expert in cosmetic chemistry and skin health.
Be encouraging, professional, and precise. AVOID generic placeholders. Give highly actionable skin suggestions.

User's active profile:
- Skin Type: ${userProfile.skinType}
- Main Concerns: ${userProfile.concerns.join(", ")}
- Active Routine Cycle: ${userProfile.routineName}
- Current Consistency Streak: ${userProfile.currentStreak} days

Keep your answers structured, utilizing clean bullet points and bold styling where appropriate. Limit answers to 3 concise, high-value paragraphs.`;

    const groqMessages = [
      { role: "system", content: systemPrompt },
      ...messages
    ];

    const chatCompletion = await client.chat.completions.create({
      messages: groqMessages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.7
    });

    return {
      role: "assistant",
      content: chatCompletion.choices[0]?.message?.content || "I'm processing your skin concerns, let's keep glowing!"
    };
  } catch (error) {
    console.error("Groq API error inside chatSkincare, falling back:", error);
    return {
      role: "assistant",
      content: "I'm having a slight cellular disconnect from my primary servers, but let's talk about your skin! Remember to keep your barrier hydrated and moisturized."
    };
  }
}

// 4. SMART SHELF SCANNER & INGREDIENT EXTRACTOR
export async function scanShelfProduct(productName: string) {
  const client = getGroqClient();

  if (!client) {
    // Beautiful mock product scanner database
    const db: Record<string, {
      name: string;
      category: string;
      pao: string;
      expiryMonths: number;
      ingredients: string[];
    }> = {
      "laroche double repair": {
        name: "La Roche-Posay Toleriane Double Repair",
        category: "Moisturizer",
        pao: "12M",
        expiryMonths: 18,
        ingredients: ["Water", "Glycerin", "Ceramide NP", "Niacinamide", "Ammonium Polyacryloyldimethyl Taurate", "Tocopherol"]
      },
      "ordinary niacinamide": {
        name: "The Ordinary Niacinamide 10% + Zinc 1%",
        category: "Serum",
        pao: "12M",
        expiryMonths: 12,
        ingredients: ["Water", "Niacinamide", "Zinc PCA", "Pentylene Glycol", "Xanthan Gum", "Phenoxyethanol"]
      },
      "paulas choice bha": {
        name: "Paula's Choice Skin Perfecting 2% BHA Liquid Exfoliant",
        category: "Toner (Exfoliant)",
        pao: "12M",
        expiryMonths: 24,
        ingredients: ["Water", "Methylpropanediol", "Butylene Glycol", "Salicylic Acid", "Polysorbate 20", "Camellia Oleifera (Green Tea) Leaf Extract"]
      },
      "cerave hydrating cleanser": {
        name: "CeraVe Hydrating Facial Cleanser",
        category: "Cleanser",
        pao: "12M",
        expiryMonths: 24,
        ingredients: ["Water", "Glycerin", "Cetearyl Alcohol", "Ceramide NP", "Ceramide AP", "Ceramide EOP", "Hyaluronic Acid", "Cholesterol"]
      },
      "skinceuticals vitamin c": {
        name: "SkinCeuticals C E Ferulic",
        category: "Serum (Antioxidant)",
        pao: "6M",
        expiryMonths: 9,
        ingredients: ["Water", "Ethoxydiglycol", "L-Ascorbic Acid (Vitamin C)", "Glycerin", "Propylene Glycol", "Laureth-23", "Alpha Tocopherol (Vitamin E)", "Ferulic Acid"]
      }
    };

    const key = productName.toLowerCase();
    for (const dbKey of Object.keys(db)) {
      if (key.includes(dbKey) || dbKey.includes(key)) {
        return db[dbKey];
      }
    }

    // Default return for custom user typed products
    return {
      name: productName.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
      category: productName.toLowerCase().includes("cleans") ? "Cleanser" :
                productName.toLowerCase().includes("moist") || productName.toLowerCase().includes("cream") ? "Moisturizer" :
                productName.toLowerCase().includes("serum") ? "Serum" : "Toner",
      pao: "12M",
      expiryMonths: 12,
      ingredients: ["Water", "Glycerin", "Phenoxyethanol", "Butylene Glycol", "Caprylyl Glycol"]
    };
  }

  try {
    const prompt = `You are a global skincare product database. Given the product name or scan text, extract details.
Product input: "${productName}"

You MUST return ONLY a valid JSON object matching this structure:
{
  "name": "Full branded product name",
  "category": "Cleanser" | "Toner" | "Serum" | "Moisturizer" | "SPF" | "Treatment",
  "pao": "e.g., 6M, 12M, 24M",
  "expiryMonths": 12,
  "ingredients": ["Ingredient 1", "Ingredient 2", ...]
}

Do your best to supply accurate, standard cosmetic ingredients for this product. If it is completely unrecognizable, invent a plausible ingredient list based on typical formulation of its category.`;

    const chatCompletion = await client.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const responseText = chatCompletion.choices[0]?.message?.content || "";
    return JSON.parse(responseText);
  } catch (error) {
    console.error("Groq API error inside scanShelfProduct, falling back:", error);
    return {
      name: productName,
      category: "Serum",
      pao: "12M",
      expiryMonths: 12,
      ingredients: ["Water", "Glycerin"]
    };
  }
}
