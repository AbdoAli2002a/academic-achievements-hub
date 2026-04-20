import { supabase } from "@/integrations/supabase/client";

export interface ReviewWithReviewer {
  id: string;
  publication_id: string;
  reviewer_id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  updated_at: string;
  reviewer: {
    id: string;
    name_ar: string;
    name_en: string | null;
    avatar_url: string | null;
    initials: string | null;
  } | null;
}

export interface ReviewStats {
  count: number;
  average: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

export const fetchPublicationReviews = async (
  publicationId: string
): Promise<ReviewWithReviewer[]> => {
  const { data, error } = await supabase
    .from("publication_reviews")
    .select(
      `*, reviewer:profiles!publication_reviews_reviewer_id_fkey1(id, name_ar, name_en, avatar_url, initials)`
    )
    .eq("publication_id", publicationId)
    .order("created_at", { ascending: false });

  // Fallback if FK alias doesn't exist (no FK declared) — fetch reviewers manually
  if (error) {
    const { data: rows, error: e2 } = await supabase
      .from("publication_reviews")
      .select("*")
      .eq("publication_id", publicationId)
      .order("created_at", { ascending: false });
    if (e2) throw e2;
    const ids = Array.from(new Set((rows ?? []).map((r) => r.reviewer_id)));
    const { data: people } = ids.length
      ? await supabase
          .from("profiles")
          .select("id, name_ar, name_en, avatar_url, initials")
          .in("id", ids)
      : { data: [] as any[] };
    const map = new Map((people ?? []).map((p: any) => [p.id, p]));
    return (rows ?? []).map((r: any) => ({
      ...r,
      reviewer: map.get(r.reviewer_id) ?? null,
    })) as ReviewWithReviewer[];
  }

  return (data ?? []) as unknown as ReviewWithReviewer[];
};

export const computeStats = (reviews: { rating: number }[]): ReviewStats => {
  const distribution: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  for (const r of reviews) {
    const k = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
    distribution[k]++;
    sum += r.rating;
  }
  return {
    count: reviews.length,
    average: reviews.length ? sum / reviews.length : 0,
    distribution,
  };
};

export const upsertReview = async (params: {
  publicationId: string;
  reviewerId: string;
  rating: number;
  reviewText?: string;
}) => {
  const { error } = await supabase.from("publication_reviews").upsert(
    {
      publication_id: params.publicationId,
      reviewer_id: params.reviewerId,
      rating: params.rating,
      review_text: params.reviewText ?? null,
    },
    { onConflict: "publication_id,reviewer_id" }
  );
  if (error) throw error;
};

export const deleteReview = async (id: string) => {
  const { error } = await supabase.from("publication_reviews").delete().eq("id", id);
  if (error) throw error;
};

export interface PublicationRatingSummary {
  publication_id: string;
  count: number;
  average: number;
}

export const fetchPublicationsRatings = async (
  publicationIds: string[]
): Promise<Map<string, PublicationRatingSummary>> => {
  const map = new Map<string, PublicationRatingSummary>();
  if (publicationIds.length === 0) return map;

  const { data, error } = await supabase
    .from("publication_reviews")
    .select("publication_id, rating")
    .in("publication_id", publicationIds);
  if (error) throw error;

  const byPub = new Map<string, number[]>();
  for (const row of data ?? []) {
    const arr = byPub.get(row.publication_id) ?? [];
    arr.push(row.rating);
    byPub.set(row.publication_id, arr);
  }

  for (const id of publicationIds) {
    const ratings = byPub.get(id) ?? [];
    const sum = ratings.reduce((a, b) => a + b, 0);
    map.set(id, {
      publication_id: id,
      count: ratings.length,
      average: ratings.length ? sum / ratings.length : 0,
    });
  }
  return map;
};
