export interface DbState {
  profile: any;
  routine: any;
  cabinet: any[];
  journals: any[];
  scans: any[];
  calendarEvents: any[];
}

export function getOrCreateUserId(): string {
  if (typeof window === "undefined") return "default";
  let userId = localStorage.getItem("rosevia_user_id");
  if (!userId) {
    userId = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("rosevia_user_id", userId);
  }
  return userId;
}

export async function fetchDbState(): Promise<DbState | null> {
  try {
    const userId = getOrCreateUserId();
    const res = await fetch(`/api/db?userId=${userId}`);
    if (!res.ok) throw new Error("Failed to fetch state");
    return await res.json();
  } catch (err) {
    console.error("Database sync GET error:", err);
    return null;
  }
}

export async function postDbAction(action: string, payload: any) {
  try {
    const userId = getOrCreateUserId();
    const res = await fetch("/api/db", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, userId, ...payload })
    });
    if (!res.ok) throw new Error("Failed to execute action");
    return await res.json();
  } catch (err) {
    console.error(`Database sync POST error (${action}):`, err);
    return null;
  }
}
