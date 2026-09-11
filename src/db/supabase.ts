/**
 * Supabase client singleton.
 * Reads SUPABASE_URL and SUPABASE_ANON_KEY from environment.
 */

import WebSocket from "ws";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types.js";

// Polyfill WebSocket for Node.js < 22
if (typeof globalThis.WebSocket === "undefined") {
  (globalThis as any).WebSocket = WebSocket;
}

let _client: SupabaseClient<Database> | null = null;

export function getSupabaseUrl(): string | undefined {
  const raw =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL;
  return raw ? raw.trim().replace(/^["']|["']$/g, "") : undefined;
}

export function getSupabaseKey(): string | undefined {
  const raw =
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;
  return raw ? raw.trim().replace(/^["']|["']$/g, "") : undefined;
}

/**
 * Returns a shared Supabase client (lazy-initialized).
 * Throws if SUPABASE_URL / SUPABASE_ANON_KEY (or aliases) are missing.
 */
export function getSupabase(): SupabaseClient<Database> {
  if (_client) return _client;

  const url = getSupabaseUrl();
  const key = getSupabaseKey();

  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_ANON_KEY (or aliases like SUPABASE_PUBLISHABLE_KEY) in environment. " +
        "Set them in .env or export them before starting the server."
    );
  }

  _client = createClient<Database>(url, key, {
    auth: { persistSession: false },
    db: { schema: "public" },
    realtime: {
      transport: WebSocket as any,
      params: { eventsPerSecond: 0 },
    },
    global: {
      headers: { "x-connection-source": "dreamdex-copilot" },
    },
  }) as any;

  return _client!;
}

/**
 * Returns true if Supabase credentials are configured.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseKey());
}

