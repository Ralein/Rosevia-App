export interface DbState {
  profile: any;
  routine: any;
  cabinet: any[];
  journals: any[];
  scans: any[];
  calendarEvents: any[];
}

export async function fetchDbState(): Promise<DbState | null> {
  try {
    const res = await fetch("/api/db");
    if (!res.ok) throw new Error("Failed to fetch state");
    return await res.json();
  } catch (err) {
    console.error("Database sync GET error:", err);
    return null;
  }
}

export async function postDbAction(action: string, payload: any) {
  try {
    const res = await fetch("/api/db", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...payload })
    });
    if (!res.ok) throw new Error("Failed to execute action");
    return await res.json();
  } catch (err) {
    console.error(`Database sync POST error (${action}):`, err);
    return null;
  }
}
