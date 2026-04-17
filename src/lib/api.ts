import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Department = Tables<"departments">;
export type Profile = Tables<"profiles">;
export type Publication = Tables<"publications">;
export type Certificate = Tables<"certificates">;
export type Award = Tables<"awards">;
export type Event = Tables<"events">;
export type Badge = Tables<"badges">;
export type MemberBadge = Tables<"member_badges">;

export interface MemberWithRelations extends Profile {
  department: Department | null;
  badges: Badge[];
  publications_count: number;
  awards_count: number;
}

export interface MemberFullProfile extends Profile {
  department: Department | null;
  badges: Badge[];
  publications: Publication[];
  certificates: Certificate[];
  awards: Award[];
  events: Event[];
}

// ---- Departments ----
export const fetchDepartments = async (): Promise<Department[]> => {
  const { data, error } = await supabase
    .from("departments")
    .select("*")
    .order("display_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
};

export const fetchDepartmentByKey = async (key: string): Promise<Department | null> => {
  const { data, error } = await supabase.from("departments").select("*").eq("key", key).maybeSingle();
  if (error) throw error;
  return data;
};

// ---- Members list (for cards) ----
export const fetchActiveMembers = async (opts?: {
  departmentId?: string;
  rank?: string;
  query?: string;
  featuredOnly?: boolean;
  limit?: number;
}): Promise<MemberWithRelations[]> => {
  let q = supabase
    .from("profiles")
    .select(`
      *,
      department:departments(*),
      member_badges(badge:badges(*)),
      publications(id, status),
      awards(id, status)
    `)
    .eq("status", "active");

  if (opts?.departmentId) q = q.eq("department_id", opts.departmentId);
  if (opts?.rank) q = q.eq("rank", opts.rank as "professor" | "associate" | "lecturer" | "assistant");
  if (opts?.featuredOnly) q = q.eq("is_featured", true);
  if (opts?.limit) q = q.limit(opts.limit);

  const { data, error } = await q;
  if (error) throw error;

  let members = (data ?? []).map((row: any) => ({
    ...row,
    department: row.department,
    badges: (row.member_badges ?? []).map((mb: any) => mb.badge).filter(Boolean),
    publications_count: (row.publications ?? []).filter((p: any) => p.status === "approved").length,
    awards_count: (row.awards ?? []).filter((a: any) => a.status === "approved").length,
  })) as MemberWithRelations[];

  // client-side text search across both languages
  if (opts?.query?.trim()) {
    const q = opts.query.trim().toLowerCase();
    members = members.filter((m) =>
      [m.name_ar, m.name_en, m.specialty_ar, m.specialty_en]
        .filter(Boolean)
        .some((s) => (s as string).toLowerCase().includes(q))
    );
  }

  return members;
};

// ---- Single full profile ----
export const fetchMemberFullProfile = async (id: string): Promise<MemberFullProfile | null> => {
  const { data, error } = await supabase
    .from("profiles")
    .select(`
      *,
      department:departments(*),
      member_badges(badge:badges(*)),
      publications(*),
      certificates(*),
      awards(*),
      events(*)
    `)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    ...data,
    department: (data as any).department,
    badges: ((data as any).member_badges ?? []).map((mb: any) => mb.badge).filter(Boolean),
    publications: ((data as any).publications ?? []).filter((p: any) => p.status === "approved"),
    certificates: ((data as any).certificates ?? []).filter((c: any) => c.status === "approved"),
    awards: ((data as any).awards ?? []).filter((a: any) => a.status === "approved"),
    events: ((data as any).events ?? []).filter((e: any) => e.status === "approved"),
  } as MemberFullProfile;
};

// ---- Stats for homepage ----
export const fetchPlatformStats = async () => {
  const [members, pubs, depts, awards] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("publications").select("id", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("departments").select("id", { count: "exact", head: true }),
    supabase.from("awards").select("id", { count: "exact", head: true }).eq("status", "approved"),
  ]);

  return {
    members: members.count ?? 0,
    publications: pubs.count ?? 0,
    departments: depts.count ?? 0,
    awards: awards.count ?? 0,
  };
};
