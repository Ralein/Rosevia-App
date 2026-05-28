import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { setupDatabase } from "@/lib/db-setup";

let isDbInitialized = false;

async function ensureDb() {
  if (!isDbInitialized) {
    await setupDatabase();
    isDbInitialized = true;
  }
}

export async function GET() {
  try {
    await ensureDb();

    // Fetch profile
    const profileRes = await query("SELECT * FROM profile WHERE id = 'default'");
    const profile = profileRes.rows[0] || null;

    // Fetch routine
    const routineRes = await query("SELECT * FROM routine WHERE id = 'default'");
    const routine = routineRes.rows[0] || null;

    // Fetch cabinet
    const cabinetRes = await query("SELECT * FROM cabinet ORDER BY created_at DESC");
    const cabinet = cabinetRes.rows;

    // Fetch journals
    const journalRes = await query("SELECT * FROM journal ORDER BY logged_at DESC");
    const journals = journalRes.rows;

    // Fetch scans
    const scansRes = await query("SELECT * FROM scans ORDER BY scanned_at DESC");
    const scans = scansRes.rows;

    // Fetch calendar events
    const eventsRes = await query("SELECT * FROM calendar_events ORDER BY event_date ASC, start_time ASC");
    const calendarEvents = eventsRes.rows;

    return NextResponse.json({
      profile: profile ? {
        skinType: profile.skin_type,
        concerns: profile.concerns,
        climate: profile.climate,
        age: profile.age,
        experience: profile.experience
      } : null,
      routine: routine ? {
        routineName: routine.routine_name,
        focus: routine.focus,
        weeklyCycle: routine.weekly_cycle,
        tips: routine.tips
      } : null,
      cabinet: cabinet.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        pao: p.pao,
        expiryDate: p.expiry_date,
        fluidLevel: p.fluid_level,
        totalTablets: p.total_tablets,
        remainingTablets: p.remaining_tablets,
        ingredients: p.ingredients
      })),
      journals: journals.map(j => ({
        id: j.id,
        water: j.water,
        sleep: j.sleep,
        stress: j.stress,
        diet: j.diet,
        menstrualPhase: j.menstrual_phase,
        notes: j.notes
      })),
      scans: scans.map(s => ({
        id: s.id,
        image: s.image,
        score: s.score,
        barrierStatus: s.barrier_status,
        diagnosis: s.diagnosis,
        metrics: s.metrics,
        explanation: s.explanation,
        scannedAt: s.scanned_at
      })),
      calendarEvents: calendarEvents.map(e => ({
        id: e.id,
        title: e.title,
        eventDate: e.event_date,
        startTime: e.start_time,
        endTime: e.end_time,
        category: e.category,
        completed: e.completed,
        notes: e.notes
      }))
    });
  } catch (error: any) {
    console.error("GET DB sync error:", error);
    return NextResponse.json({ error: error.message || "Failed to load database state" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureDb();
    const body = await request.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json({ error: "Missing action parameter" }, { status: 400 });
    }

    switch (action) {
      case "save_profile": {
        const { skinType, concerns, climate, age, experience } = body.profile;
        await query(
          `INSERT INTO profile (id, skin_type, concerns, climate, age, experience, updated_at)
           VALUES ('default', $1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
           ON CONFLICT (id) DO UPDATE 
           SET skin_type = $1, concerns = $2, climate = $3, age = $4, experience = $5, updated_at = CURRENT_TIMESTAMP`,
          [skinType, JSON.stringify(concerns), climate, age, experience]
        );
        return NextResponse.json({ success: true });
      }

      case "save_routine": {
        const { routineName, focus, weeklyCycle, tips } = body.routine;
        await query(
          `INSERT INTO routine (id, routine_name, focus, weekly_cycle, tips, updated_at)
           VALUES ('default', $1, $2, $3, $4, CURRENT_TIMESTAMP)
           ON CONFLICT (id) DO UPDATE 
           SET routine_name = $1, focus = $2, weekly_cycle = $3, tips = $4, updated_at = CURRENT_TIMESTAMP`,
          [routineName, focus, JSON.stringify(weeklyCycle), JSON.stringify(tips)]
        );
        return NextResponse.json({ success: true });
      }

      case "save_cabinet_item": {
        const { id, name, category, pao, expiryDate, fluidLevel, totalTablets, remainingTablets, ingredients } = body.item;
        await query(
          `INSERT INTO cabinet (id, name, category, pao, expiry_date, fluid_level, total_tablets, remaining_tablets, ingredients, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
           ON CONFLICT (id) DO UPDATE 
           SET name = $2, category = $3, pao = $4, expiry_date = $5, fluid_level = $6, total_tablets = $7, remaining_tablets = $8, ingredients = $9`,
          [id, name, category, pao, expiryDate, fluidLevel, totalTablets, remainingTablets, JSON.stringify(ingredients)]
        );
        return NextResponse.json({ success: true });
      }

      case "delete_cabinet_item": {
        const { id } = body;
        await query("DELETE FROM cabinet WHERE id = $1", [id]);
        return NextResponse.json({ success: true });
      }

      case "save_journal": {
        const { id, water, sleep, stress, diet, menstrualPhase, notes } = body.log;
        await query(
          `INSERT INTO journal (id, water, sleep, stress, diet, menstrual_phase, notes, logged_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
           ON CONFLICT (id) DO UPDATE 
           SET water = $2, sleep = $3, stress = $4, diet = $5, menstrual_phase = $6, notes = $7, logged_at = CURRENT_TIMESTAMP`,
          [id, water, sleep, stress, JSON.stringify(diet), menstrualPhase || null, notes]
        );
        return NextResponse.json({ success: true });
      }

      case "save_scan": {
        const { id, image, score, barrierStatus, diagnosis, metrics, explanation } = body.scan;
        await query(
          `INSERT INTO scans (id, image, score, barrier_status, diagnosis, metrics, explanation, scanned_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)`,
          [id, image, score, barrierStatus, diagnosis, JSON.stringify(metrics), explanation]
        );
        return NextResponse.json({ success: true });
      }

      case "delete_scan": {
        const { id } = body;
        await query("DELETE FROM scans WHERE id = $1", [id]);
        return NextResponse.json({ success: true });
      }

      case "save_calendar_event": {
        const { id, title, eventDate, startTime, endTime, category, completed, notes } = body.event;
        await query(
          `INSERT INTO calendar_events (id, title, event_date, start_time, end_time, category, completed, notes, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
           ON CONFLICT (id) DO UPDATE 
           SET title = $2, event_date = $3, start_time = $4, end_time = $5, category = $6, completed = $7, notes = $8`,
          [id, title, eventDate, startTime, endTime, category, completed, notes]
        );
        return NextResponse.json({ success: true });
      }

      case "delete_calendar_event": {
        const { id } = body;
        await query("DELETE FROM calendar_events WHERE id = $1", [id]);
        return NextResponse.json({ success: true });
      }

      case "take_pill": {
        const { id } = body;
        const res = await query("SELECT remaining_tablets FROM cabinet WHERE id = $1", [id]);
        if (res.rows.length > 0) {
          const currentVal = res.rows[0].remaining_tablets;
          if (currentVal !== null && currentVal > 0) {
            await query("UPDATE cabinet SET remaining_tablets = $1 WHERE id = $2", [currentVal - 1, id]);
            return NextResponse.json({ success: true, remaining: currentVal - 1 });
          }
        }
        return NextResponse.json({ success: false, error: "No tablets remaining or product not found" });
      }

      default:
        return NextResponse.json({ error: `Unknown action '${action}'` }, { status: 400 });
    }
  } catch (error: any) {
    console.error("POST DB sync error:", error);
    return NextResponse.json({ error: error.message || "Failed to process database write" }, { status: 500 });
  }
}
