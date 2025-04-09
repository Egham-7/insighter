"use client";

import Database from "@tauri-apps/plugin-sql";

const db = await Database.load("sqlite:insighter.db");

export default db;
