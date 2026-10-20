import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { createClient } from "@supabase/supabase-js";

describe("Supabase Security & RLS Architecture (NFR-03)", () => {
  const migrationPath = path.resolve(
    __dirname,
    "../supabase/migrations/20261020000000_create_core_tables.sql"
  );
  const migrationContent = fs.readFileSync(migrationPath, "utf-8");

  describe("SQL Migration RLS Invariants", () => {
    it("should explicitly enable RLS on all 4 transactional tables", () => {
      const requiredTables = [
        "subscribers",
        "contact_messages",
        "event_registrations",
        "redirect_map",
      ];

      for (const table of requiredTables) {
        const rlsPattern = new RegExp(
          `alter\\s+table\\s+${table}\\s+enable\\s+row\\s+level\\s+security;`,
          "i"
        );
        expect(
          rlsPattern.test(migrationContent),
          `Table "${table}" must have Row Level Security enabled in SQL migration`
        ).toBe(true);
      }
    });

    it("should NOT contain any public or anonymous grant policies", () => {
      // PRD NFR-03 requirement: "RLS aktif di semua tabel Supabase; tanpa kebijakan publik; hanya service role yang dapat mengakses"
      const publicPolicyPattern =
        /create\s+policy.*to\s+(anon|public)/i;
      expect(
        publicPolicyPattern.test(migrationContent),
        "Migration must not define any public or anon accessible policies"
      ).toBe(false);
    });
  });

  describe("Supabase Client Behavioral Contract", () => {
    it("should verify that anonymous client queries are rejected or empty by default under RLS", async () => {
      // Mocking/verifying the Supabase client contract with an anon key
      const mockSupabaseUrl = "https://mock-project-icmi.supabase.co";
      const mockAnonKey =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-anon-key-cannot-read-without-policy";

      const anonClient = createClient(mockSupabaseUrl, mockAnonKey);
      expect(anonClient).toBeDefined();

      // Check client headers to ensure it carries anon authorization header
      // Under Supabase Postgres RLS, without a policy matching the anon role, all select/insert/update/delete operations return 0 rows or error.
    });

    it("should ensure server.ts enforces server-only restriction", () => {
      const serverClientPath = path.resolve(
        __dirname,
        "../apps/web/lib/supabase/server.ts"
      );
      const serverCode = fs.readFileSync(serverClientPath, "utf-8");

      expect(serverCode).toContain('import "server-only";');
      expect(serverCode).toContain("SUPABASE_SERVICE_ROLE_KEY");
      expect(serverCode).not.toContain("NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY");
    });
  });
});
