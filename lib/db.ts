import Database from "@tauri-apps/plugin-sql";

let db: Database | null = null;

// Only initialize the database on the client side
if (typeof window !== "undefined") {
  // Use an immediately invoked async function
  (async () => {
    try {
      db = await Database.load("sqlite:insighter.db");
    } catch (error) {
      console.error("Failed to load database:", error);
    }
  })();
}

export default db;
