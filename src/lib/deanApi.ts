import { supabase } from "@/integrations/supabase/client";

export interface DeanProfile {
  id: string;
  user_id: string | null;
  name_ar: string;
  name_en: string | null;
  title_ar: string | null;
  title_en: string | null;
  bio_ar: string | null;
  bio_en: string | null;
  message_ar: string | null;
  message_en: string | null;
  vision_ar: string | null;
  vision_en: string | null;
  mission_ar: string | null;
  mission_en: string | null;
  avatar_url: string | null;
  email: string | null;
  phone: string | null;
}

export interface CollegeAchievement {
  id: string;
  title_ar: string;
  title_en: string | null;
  description_ar: string | null;
  description_en: string | null;
  year: number | null;
  image_url: string | null;
  display_order: number;
}

export interface CollegeNews {
  id: string;
  title_ar: string;
  title_en: string | null;
  content_ar: string | null;
  content_en: string | null;
  image_url: string | null;
  published_at: string;
}

export const fetchDeanProfile = async (): Promise<DeanProfile | null> => {
  const { data, error } = await supabase.from("dean_profile").select("*").order("created_at", { ascending: true }).limit(1).maybeSingle();
  if (error) throw error;
  return data as DeanProfile | null;
};

export const upsertDeanProfile = async (payload: Partial<DeanProfile>): Promise<DeanProfile> => {
  const existing = await fetchDeanProfile();
  if (existing) {
    const { data, error } = await supabase.from("dean_profile").update(payload).eq("id", existing.id).select().single();
    if (error) throw error;
    return data as DeanProfile;
  }
  const { data: userRes } = await supabase.auth.getUser();
  const { data, error } = await supabase.from("dean_profile").insert({ ...payload, name_ar: payload.name_ar ?? "", user_id: userRes.user?.id ?? null }).select().single();
  if (error) throw error;
  return data as DeanProfile;
};

export const fetchCollegeAchievements = async (): Promise<CollegeAchievement[]> => {
  const { data, error } = await supabase.from("college_achievements").select("*").order("display_order").order("year", { ascending: false });
  if (error) throw error;
  return (data ?? []) as CollegeAchievement[];
};

export const upsertCollegeAchievement = async (a: Partial<CollegeAchievement> & { id?: string }) => {
  if (a.id) {
    const { id, ...rest } = a;
    const { error } = await supabase.from("college_achievements").update(rest).eq("id", id);
    if (error) throw error;
  } else {
    const { data: userRes } = await supabase.auth.getUser();
    const { error } = await supabase.from("college_achievements").insert({ title_ar: a.title_ar ?? "", ...a, created_by: userRes.user?.id ?? null });
    if (error) throw error;
  }
};

export const deleteCollegeAchievement = async (id: string) => {
  const { error } = await supabase.from("college_achievements").delete().eq("id", id);
  if (error) throw error;
};

export const fetchCollegeNews = async (): Promise<CollegeNews[]> => {
  const { data, error } = await supabase.from("college_news").select("*").order("published_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as CollegeNews[];
};

export const upsertCollegeNews = async (n: Partial<CollegeNews> & { id?: string }) => {
  if (n.id) {
    const { id, ...rest } = n;
    const { error } = await supabase.from("college_news").update(rest).eq("id", id);
    if (error) throw error;
  } else {
    const { data: userRes } = await supabase.auth.getUser();
    const { error } = await supabase.from("college_news").insert({ title_ar: n.title_ar ?? "", ...n, created_by: userRes.user?.id ?? null });
    if (error) throw error;
  }
};

export const deleteCollegeNews = async (id: string) => {
  const { error } = await supabase.from("college_news").delete().eq("id", id);
  if (error) throw error;
};
