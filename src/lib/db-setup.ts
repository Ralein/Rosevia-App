import { query } from "./db";

export async function setupDatabase() {
  console.log("Setting up Neon PostgreSQL database schemas...");
  try {
    // 1. Profile Table
    await query(`
      CREATE TABLE IF NOT EXISTS profile (
        id VARCHAR(50) PRIMARY KEY,
        skin_type VARCHAR(50),
        concerns JSONB,
        climate VARCHAR(100),
        age VARCHAR(50),
        experience VARCHAR(50),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Routine Table
    await query(`
      CREATE TABLE IF NOT EXISTS routine (
        id VARCHAR(50) PRIMARY KEY,
        routine_name VARCHAR(255),
        focus TEXT,
        weekly_cycle JSONB,
        tips JSONB,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Cabinet Table
    await query(`
      CREATE TABLE IF NOT EXISTS cabinet (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255),
        category VARCHAR(50),
        pao VARCHAR(20),
        expiry_date VARCHAR(50),
        fluid_level INTEGER,
        total_tablets INTEGER DEFAULT NULL,
        remaining_tablets INTEGER DEFAULT NULL,
        ingredients JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 4. Journal Table
    await query(`
      CREATE TABLE IF NOT EXISTS journal (
        id VARCHAR(50) PRIMARY KEY,
        water INTEGER,
        sleep INTEGER,
        stress VARCHAR(20),
        diet JSONB,
        menstrual_phase VARCHAR(100),
        notes TEXT,
        logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 5. Scans Table
    await query(`
      CREATE TABLE IF NOT EXISTS scans (
        id VARCHAR(50) PRIMARY KEY,
        image TEXT,
        score INTEGER,
        barrier_status VARCHAR(100),
        diagnosis TEXT,
        metrics JSONB,
        explanation TEXT,
        scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 6. Calendar Events Table
    await query(`
      CREATE TABLE IF NOT EXISTS calendar_events (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255),
        event_date VARCHAR(50),
        start_time VARCHAR(20),
        end_time VARCHAR(20),
        category VARCHAR(50),
        completed BOOLEAN DEFAULT FALSE,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("Rosevia database setup completed successfully.");
    return true;
  } catch (error) {
    console.error("Failed to set up Rosevia database:", error);
    return false;
  }
}
