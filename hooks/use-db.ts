import { useState, useEffect } from "react";
import Database from "@tauri-apps/plugin-sql";

export function useDatabase() {
  const [db, setDb] = useState<Database | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadDatabase() {
      try {
        const database = await Database.load("sqlite:insighter.db");
        setDb(database);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      }
    }

    loadDatabase();
  }, []);

  return { db, loading, error };
}
