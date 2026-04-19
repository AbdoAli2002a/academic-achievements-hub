import { supabase } from "@/integrations/supabase/client";
import type { Department, Badge } from "@/lib/api";

export interface LeaderboardEntry {
  id: string;
  name_ar: string;
  name_en: string | null;
  avatar_url: string | null;
  initials: string | null;
  rank: string | null;
  department: Department | null;
  publications_count: number;
  awards_count: number;
  events_count: number;
  badges: Badge[];
  score: number;
}

export const fetchLeaderboard = async (departmentId?: string): Promise<LeaderboardEntry[]> => {
  let q = supabase
    .from("profiles")
    .select(`
      id, name_ar, name_en, avatar_url, initials, rank,
      department:departments(*),
      publications(id, status),
      awards(id, status),
      events(id, status),
      member_badges(badge:badges(*))
    `)
    .eq("status", "active");

  if (departmentId && departmentId !== "all") q = q.eq("department_id", departmentId);

  const { data, error } = await q;
  if (error) throw error;

  const entries: LeaderboardEntry[] = (data ?? []).map((row: any) => {
    const pubs = (row.publications ?? []).filter((p: any) => p.status === "approved").length;
    const awards = (row.awards ?? []).filter((a: any) => a.status === "approved").length;
    const events = (row.events ?? []).filter((e: any) => e.status === "approved").length;
    const badges = (row.member_badges ?? []).map((mb: any) => mb.badge).filter(Boolean) as Badge[];
    // Score: publications x3 + awards x5 + events x2 + badges x4
    const score = pubs * 3 + awards * 5 + events * 2 + badges.length * 4;
    return {
      id: row.id,
      name_ar: row.name_ar,
      name_en: row.name_en,
      avatar_url: row.avatar_url,
      initials: row.initials,
      rank: row.rank,
      department: row.department,
      publications_count: pubs,
      awards_count: awards,
      events_count: events,
      badges,
      score,
    };
  });

  // Only include those with at least 1 contribution
  return entries
    .filter((e) => e.score > 0)
    .sort((a, b) => b.score - a.score);
};
