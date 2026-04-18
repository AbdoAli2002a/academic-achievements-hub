import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];
export type ContentStatus = Database["public"]["Enums"]["content_status"];

export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  profile: any | null;
  roles: AppRole[];
}

// ---------- Users ----------
export const fetchAdminUsers = async (): Promise<AdminUser[]> => {
  const { data, error } = await supabase.functions.invoke("admin-users", {
    method: "GET",
  });
  if (error) throw error;
  return (data?.users ?? []) as AdminUser[];
};

export const setUserRole = async (userId: string, role: AppRole) => {
  // Replace existing role(s) with the chosen one
  const { error: delErr } = await supabase.from("user_roles").delete().eq("user_id", userId);
  if (delErr) throw delErr;
  const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
  if (error) throw error;
};

export const updateProfileStatus = async (
  userId: string,
  status: Database["public"]["Enums"]["member_status"],
) => {
  const { error } = await supabase.from("profiles").update({ status }).eq("id", userId);
  if (error) throw error;
};

export const setProfileFeatured = async (userId: string, featured: boolean) => {
  const { error } = await supabase.from("profiles").update({ is_featured: featured }).eq("id", userId);
  if (error) throw error;
};

export const setProfileDepartment = async (userId: string, departmentId: string | null) => {
  const { error } = await supabase
    .from("profiles")
    .update({ department_id: departmentId })
    .eq("id", userId);
  if (error) throw error;
};

// ---------- Approval workflow ----------
export type ContentTable = "publications" | "certificates" | "awards" | "events";

export const fetchPendingContent = async (table: ContentTable) => {
  const { data, error } = await supabase
    .from(table as any)
    .select("*, profile:profiles(id, name_ar, name_en, avatar_url)")
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
};

export const fetchAllContentCounts = async () => {
  const tables: ContentTable[] = ["publications", "certificates", "awards", "events"];
  const results = await Promise.all(
    tables.map((t) =>
      supabase.from(t as any).select("id", { count: "exact", head: true }).eq("status", "pending"),
    ),
  );
  return Object.fromEntries(tables.map((t, i) => [t, results[i].count ?? 0])) as Record<
    ContentTable,
    number
  >;
};

export const reviewContent = async (
  table: ContentTable,
  id: string,
  status: "approved" | "rejected",
  reviewerId: string,
  rejectionReason?: string,
) => {
  const patch: any = {
    status,
    reviewed_by: reviewerId,
    reviewed_at: new Date().toISOString(),
  };
  if (table === "publications" && rejectionReason) patch.rejection_reason = rejectionReason;
  const { error } = await supabase.from(table as any).update(patch).eq("id", id);
  if (error) throw error;
};

// ---------- Badges ----------
export const fetchAllBadges = async () => {
  const { data, error } = await supabase.from("badges").select("*").order("created_at");
  if (error) throw error;
  return data ?? [];
};

export const createBadge = async (payload: {
  key: string;
  name_ar: string;
  name_en: string;
  description_ar?: string;
  description_en?: string;
  icon?: string;
  color?: string;
}) => {
  const { data, error } = await supabase.from("badges").insert(payload).select().single();
  if (error) throw error;
  return data;
};

export const deleteBadge = async (id: string) => {
  const { error } = await supabase.from("badges").delete().eq("id", id);
  if (error) throw error;
};

export const grantBadge = async (profileId: string, badgeId: string, grantedBy: string, note?: string) => {
  const { error } = await supabase
    .from("member_badges")
    .insert({ profile_id: profileId, badge_id: badgeId, granted_by: grantedBy, note });
  if (error) throw error;
};

export const revokeBadge = async (memberBadgeId: string) => {
  const { error } = await supabase.from("member_badges").delete().eq("id", memberBadgeId);
  if (error) throw error;
};

export const fetchMemberBadges = async (profileId: string) => {
  const { data, error } = await supabase
    .from("member_badges")
    .select("*, badge:badges(*)")
    .eq("profile_id", profileId);
  if (error) throw error;
  return data ?? [];
};

// ---------- Stats / Analytics ----------
export const fetchAdminStats = async () => {
  const [members, pubs, awards, certs, events, pending, depts] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("publications").select("id", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("awards").select("id", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("certificates").select("id", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("events").select("id", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("publications").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("departments").select("id", { count: "exact", head: true }),
  ]);
  return {
    members: members.count ?? 0,
    publications: pubs.count ?? 0,
    awards: awards.count ?? 0,
    certificates: certs.count ?? 0,
    events: events.count ?? 0,
    pendingPublications: pending.count ?? 0,
    departments: depts.count ?? 0,
  };
};

export const fetchPublicationsByYear = async () => {
  const { data, error } = await supabase
    .from("publications")
    .select("publication_year")
    .eq("status", "approved");
  if (error) throw error;
  const byYear: Record<number, number> = {};
  (data ?? []).forEach((p: any) => {
    byYear[p.publication_year] = (byYear[p.publication_year] ?? 0) + 1;
  });
  return Object.entries(byYear)
    .map(([year, count]) => ({ year: Number(year), count }))
    .sort((a, b) => a.year - b.year);
};

export const fetchMembersByDepartment = async () => {
  const { data, error } = await supabase
    .from("profiles")
    .select("department:departments(name_ar, key)")
    .eq("status", "active");
  if (error) throw error;
  const map: Record<string, number> = {};
  (data ?? []).forEach((row: any) => {
    const name = row.department?.name_ar ?? "بدون قسم";
    map[name] = (map[name] ?? 0) + 1;
  });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
};
