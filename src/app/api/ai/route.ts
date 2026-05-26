import { NextResponse } from "next/server";
import { 
  generateQuizRoutine, 
  checkIngredientConflicts, 
  chatSkincare, 
  scanShelfProduct 
} from "@/lib/groq";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json({ error: "Missing required parameter 'action'" }, { status: 400 });
    }

    switch (action) {
      case "quiz": {
        const { skinType, concerns, climate, age, experience } = body;
        if (!skinType || !concerns || !climate || !age || !experience) {
          return NextResponse.json({ error: "Missing quiz inputs" }, { status: 400 });
        }
        const routine = await generateQuizRoutine({ skinType, concerns, climate, age, experience });
        return NextResponse.json({ routine });
      }

      case "conflict": {
        const { ingredients } = body;
        if (!ingredients || !Array.isArray(ingredients)) {
          return NextResponse.json({ error: "Missing ingredients array" }, { status: 400 });
        }
        const conflicts = await checkIngredientConflicts(ingredients);
        return NextResponse.json({ conflicts });
      }

      case "chat": {
        const { messages, userProfile } = body;
        if (!messages || !Array.isArray(messages) || !userProfile) {
          return NextResponse.json({ error: "Missing chat parameters" }, { status: 400 });
        }
        const reply = await chatSkincare(messages, userProfile);
        return NextResponse.json({ reply });
      }

      case "scan": {
        const { productName } = body;
        if (!productName) {
          return NextResponse.json({ error: "Missing product name" }, { status: 400 });
        }
        const product = await scanShelfProduct(productName);
        return NextResponse.json({ product });
      }

      default:
        return NextResponse.json({ error: `Invalid action '${action}'` }, { status: 400 });
    }
  } catch (error: any) {
    console.error("API error inside /api/ai/route:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
