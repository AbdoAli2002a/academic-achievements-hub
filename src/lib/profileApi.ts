import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

// ---------- Profile ----------
export const fetchMyProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*, department:departments(*)")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
};

export const updateMyProfile = async (userId: string, patch: TablesUpdate<"profiles">) => {
  const { data, error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", userId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// ---------- Avatar upload ----------
export const uploadAvatar = async (userId: string, file: File): Promise<string> => {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${userId}/avatar-${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, cacheControl: "3600" });
  if (error) throw error;
  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
};

// ---------- Achievements image upload ----------
export const uploadAchievementImage = async (userId: string, file: File): Promise<string> => {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage
    .from("achievements")
    .upload(path, file, { cacheControl: "3600" });
  if (error) throw error;
  const { data } = supabase.storage.from("achievements").getPublicUrl(path);
  return data.publicUrl;
};

// ---------- Generic CRUD for content tables ----------
type ContentTable = "publications" | "certificates" | "awards" | "events";

export const listMyContent = async <T = any>(table: ContentTable, profileId: string): Promise<T[]> => {
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as T[];
};

export const insertContent = async (table: ContentTable, payload: any) => {
  const { data, error } = await supabase.from(table as any).insert(payload).select().single();
  if (error) throw error;
  return data;
};

export const updateContent = async (table: ContentTable, id: string, patch: any) => {
  const { data, error } = await supabase.from(table as any).update(patch).eq("id", id).select().single();
  if (error) throw error;
  return data;
};

export const deleteContent = async (table: ContentTable, id: string) => {
  const { error } = await supabase.from(table as any).delete().eq("id", id);
  if (error) throw error;
};

// ---------- Departments (for select) ----------
export const fetchAllDepartments = async () => {
  const { data, error } = await supabase.from("departments").select("*").order("display_order");
  if (error) throw error;
  return data ?? [];
};
