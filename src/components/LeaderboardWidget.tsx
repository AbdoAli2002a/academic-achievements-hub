import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Crown, Medal, Award, Trophy, ArrowLeft, ArrowRight, Loader2, BookOpen } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchLeaderboard } from "@/lib/leaderboardApi";

const RANK_ICON = [Crown, Medal, Award];
const RANK_COLOR = ["text-gold", "text-muted-foreground", "text-accent"];

export const LeaderboardWidget = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["leaderboard", "top5"],
    queryFn: () => fetchLeaderboard(),
  });

  const top5 = entries.slice(0, 5);

  return (
    <div className="card-elegant p-6 md:p-8 bg-gradient-to-br from-gold/5 via-background to-accent/5 border-gold/20">
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-gold to-gold/70 shadow-gold">
            <Trophy className="h-6 w-6 text-gold-foreground" />
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-extrabold text-gradient-primary">
              {t("leaderboardWidget.title")}
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground">
              {t("leaderboardWidget.subtitle")}
            </p>
          </div>
        </div>
        <Button asChild variant="outline" size="sm" className="gap-2 border-gold/40 hover:bg-gold/10">
          <Link to="/leaderboard">
            {t("leaderboardWidget.viewFull")}
            <Arrow className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
        </div>
      ) : top5.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-8">
          {t("leaderboard.empty")}
        </p>
      ) : (
        <ol className="space-y-2">
          {top5.map((entry, i) => {
            const Icon = i < 3 ? RANK_ICON[i] : null;
            const name = isAr ? entry.name_ar : entry.name_en || entry.name_ar;
            const deptName = entry.department
              ? isAr
                ? entry.department.name_ar
                : entry.department.name_en
              : null;

            return (
              <li key={entry.id}>
                <Link
                  to={`/member/${entry.id}`}
                  className="group flex items-center gap-3 p-3 rounded-lg hover:bg-accent-soft/50 transition-colors"
                >
                  <div className="flex items-center justify-center w-8 shrink-0">
                    {Icon ? (
                      <Icon className={`h-5 w-5 ${RANK_COLOR[i]}`} />
                    ) : (
                      <span className="text-sm font-bold text-muted-foreground">
                        #{i + 1}
                      </span>
                    )}
                  </div>

                  <Avatar className="h-10 w-10 shrink-0 ring-2 ring-background">
                    {entry.avatar_url && <AvatarImage src={entry.avatar_url} alt={name} />}
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs">
                      {entry.initials || name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate group-hover:text-accent transition-colors">
                      {name}
                    </div>
                    {deptName && (
                      <div className="text-xs text-muted-foreground truncate">{deptName}</div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                      <BookOpen className="h-3.5 w-3.5" />
                      {entry.publications_count}
                    </div>
                    <Badge variant="secondary" className="bg-gold/15 text-foreground border-gold/30 font-bold tabular-nums">
                      {entry.score}
                    </Badge>
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
};
