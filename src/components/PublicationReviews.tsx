import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Loader2, Trash2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import {
  fetchPublicationReviews,
  upsertReview,
  deleteReview,
  computeStats,
} from "@/lib/reviewsApi";
import { useAuth } from "@/hooks/useAuth";
import { StarRating } from "./StarRating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PublicationReviewsProps {
  publicationId: string;
  publicationOwnerId: string;
}

export const PublicationReviews = ({
  publicationId,
  publicationOwnerId,
}: PublicationReviewsProps) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const { user, hasRole } = useAuth();
  const qc = useQueryClient();

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["publication-reviews", publicationId],
    queryFn: () => fetchPublicationReviews(publicationId),
  });

  const stats = computeStats(reviews);
  const myReview = user ? reviews.find((r) => r.reviewer_id === user.id) : null;
  const isOwner = user?.id === publicationOwnerId;
  const canReview =
    !!user && !isOwner && (hasRole("professor") || hasRole("super_admin"));

  const [rating, setRating] = useState<number>(myReview?.rating ?? 0);
  const [text, setText] = useState<string>(myReview?.review_text ?? "");
  const [editing, setEditing] = useState(false);

  const saveMut = useMutation({
    mutationFn: () =>
      upsertReview({
        publicationId,
        reviewerId: user!.id,
        rating,
        reviewText: text.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success(t("reviews.saved"));
      setEditing(false);
      qc.invalidateQueries({ queryKey: ["publication-reviews", publicationId] });
    },
    onError: (e: any) => toast.error(e.message ?? t("reviews.error")),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteReview(id),
    onSuccess: () => {
      toast.success(t("reviews.deleted"));
      setRating(0);
      setText("");
      qc.invalidateQueries({ queryKey: ["publication-reviews", publicationId] });
    },
    onError: (e: any) => toast.error(e.message ?? t("reviews.error")),
  });

  const handleSave = () => {
    if (rating < 1 || rating > 5) {
      toast.error(t("reviews.pickStars"));
      return;
    }
    if (text.length > 1000) {
      toast.error(t("reviews.tooLong"));
      return;
    }
    saveMut.mutate();
  };

  return (
    <div className="mt-4 pt-4 border-t border-border/50 space-y-4">
      {/* Stats summary */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="text-2xl font-extrabold text-foreground">
            {stats.average.toFixed(1)}
          </div>
          <div>
            <StarRating value={stats.average} readOnly size="sm" />
            <div className="text-xs text-muted-foreground">
              {stats.count} {t("reviews.count")}
            </div>
          </div>
        </div>

        {stats.count > 0 && (
          <div className="flex-1 min-w-[180px] space-y-1">
            {[5, 4, 3, 2, 1].map((s) => {
              const pct = stats.count
                ? (stats.distribution[s as 1 | 2 | 3 | 4 | 5] / stats.count) * 100
                : 0;
              return (
                <div key={s} className="flex items-center gap-2 text-xs">
                  <span className="w-3 text-muted-foreground">{s}</span>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-end text-muted-foreground">
                    {stats.distribution[s as 1 | 2 | 3 | 4 | 5]}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review form */}
      {canReview && (
        <div className="rounded-lg bg-muted/30 p-3 space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-sm font-semibold">
              {myReview && !editing ? t("reviews.yourReview") : t("reviews.writeYours")}
            </span>
            {myReview && !editing ? (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setRating(myReview.rating);
                    setText(myReview.review_text ?? "");
                    setEditing(true);
                  }}
                >
                  {t("reviews.edit")}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteMut.mutate(myReview.id)}
                  disabled={deleteMut.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ) : null}
          </div>

          {!myReview || editing ? (
            <>
              <StarRating value={rating} onChange={setRating} size="lg" />
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t("reviews.placeholder")}
                rows={3}
                maxLength={1000}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {text.length}/1000
                </span>
                <div className="flex gap-2">
                  {editing && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditing(false);
                        setRating(myReview?.rating ?? 0);
                        setText(myReview?.review_text ?? "");
                      }}
                    >
                      {t("reviews.cancel")}
                    </Button>
                  )}
                  <Button size="sm" onClick={handleSave} disabled={saveMut.isPending}>
                    {saveMut.isPending && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    {t("reviews.submit")}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <StarRating value={myReview.rating} readOnly size="md" />
              {myReview.review_text && (
                <p className="text-sm text-muted-foreground">{myReview.review_text}</p>
              )}
            </div>
          )}
        </div>
      )}

      {isOwner && (
        <p className="text-xs text-muted-foreground italic">
          {t("reviews.ownerNote")}
        </p>
      )}

      {!user && (
        <p className="text-xs text-muted-foreground italic">
          {t("reviews.loginNote")}
        </p>
      )}

      {/* Reviews list */}
      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-accent" />
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          {t("reviews.empty")}
        </p>
      ) : (
        <ul className="space-y-3">
          {reviews
            .filter((r) => r.id !== myReview?.id)
            .map((r) => {
              const reviewerName = r.reviewer
                ? isAr
                  ? r.reviewer.name_ar
                  : r.reviewer.name_en || r.reviewer.name_ar
                : t("reviews.anonymous");
              return (
                <li key={r.id} className="flex gap-3">
                  <Avatar className="h-9 w-9 shrink-0">
                    {r.reviewer?.avatar_url && (
                      <AvatarImage src={r.reviewer.avatar_url} alt={reviewerName} />
                    )}
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs">
                      {r.reviewer?.initials || reviewerName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold">{reviewerName}</span>
                      <StarRating value={r.rating} readOnly size="sm" />
                    </div>
                    {r.review_text && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {r.review_text}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
        </ul>
      )}
    </div>
  );
};
