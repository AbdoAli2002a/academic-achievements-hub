import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Trophy, Medal, Award, Crown, ArrowLeft, ArrowRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BadgeIcon } from "@/components/BadgeIcon";
import { fetchDepartments } from "@/lib/api";
import { fetchLeaderboard, type LeaderboardEntry } from "@/lib/leaderboardApi";
import { cn } from "@/lib/utils";

type SortKey = "score" | "publications_count" | "awards_count" | "events_count";

const Leaderboard = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  const [dept, setDept] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("score");

  const { data: departments } = useQuery({ queryKey: ["departments"], queryFn: fetchDepartments });
  const { data: rows, isLoading } = useQuery({
    queryKey: ["leaderboard", dept],
    queryFn: () => fetchLeaderboard(dept),
  });

  const sorted = useMemo(() => {
    if (!rows) return [];
    return [...rows].sort((a, b) => (b[sortKey] as number) - (a[sortKey] as number));
  }, [rows, sortKey]);

  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  return (
    <div className="container-academic py-10 lg:py-14">
      {/* Header */}
      <header className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-soft text-accent text-sm font-semibold mb-4">
          <Trophy className="h-4 w-4" />
          {t("leaderboard.badge")}
        </div>
        <h1 className="text-3xl lg:text-5xl font-bold mb-3 bg-gradient-primary bg-clip-text text-transparent">
          {t("leaderboard.title")}
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">{t("leaderboard.subtitle")}</p>
      </header>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-8">
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground whitespace-nowrap">
            {t("leaderboard.department")}:
          </label>
          <Select value={dept} onValueChange={setDept}>
            <SelectTrigger className="w-[220px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("search.allDepts")}</SelectItem>
              {departments?.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {isAr ? d.name_ar : d.name_en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
          <TabsList>
            <TabsTrigger value="score">{t("leaderboard.sortScore")}</TabsTrigger>
            <TabsTrigger value="publications_count">{t("leaderboard.sortPubs")}</TabsTrigger>
            <TabsTrigger value="awards_count">{t("leaderboard.sortAwards")}</TabsTrigger>
            <TabsTrigger value="events_count">{t("leaderboard.sortEvents")}</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="grid gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">{t("leaderboard.empty")}</Card>
      ) : (
        <>
          {/* Podium */}
          {top3.length > 0 && (
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
              {/* Reorder for visual podium on md+: 2-1-3 */}
              {[1, 0, 2].map((idx) => {
                const entry = top3[idx];
                if (!entry) return <div key={idx} className="hidden md:block" />;
                return <PodiumCard key={entry.id} entry={entry} place={idx + 1} isAr={isAr} />;
              })}
            </section>
          )}

          {/* Table */}
          {rest.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-lg font-semibold mb-3 text-foreground">
                {t("leaderboard.others")}
              </h2>
              {rest.map((entry, i) => (
                <RowCard key={entry.id} entry={entry} place={i + 4} isAr={isAr} Arrow={Arrow} />
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
};

const PodiumCard = ({ entry, place, isAr }: { entry: LeaderboardEntry; place: number; isAr: boolean }) => {
  const name = isAr ? entry.name_ar : entry.name_en || entry.name_ar;
  const dept = entry.department ? (isAr ? entry.department.name_ar : entry.department.name_en) : "";

  const styles =
    place === 1
      ? "md:-translate-y-4 ring-2 ring-yellow-500/40 bg-gradient-to-br from-yellow-500/10 to-transparent"
      : place === 2
      ? "ring-2 ring-slate-400/40 bg-gradient-to-br from-slate-400/10 to-transparent"
      : "ring-2 ring-orange-500/40 bg-gradient-to-br from-orange-500/10 to-transparent";

  const Icon = place === 1 ? Crown : place === 2 ? Medal : Award;
  const iconColor = place === 1 ? "text-yellow-500" : place === 2 ? "text-slate-400" : "text-orange-500";

  return (
    <Card className={cn("p-6 text-center relative overflow-hidden transition-all hover:shadow-elegant", styles)}>
      <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3">
        <Icon className={cn("h-6 w-6", iconColor)} />
      </div>
      <div className="flex flex-col items-center">
        <Avatar className="h-20 w-20 ring-2 ring-accent/30 mb-3">
          {entry.avatar_url && <AvatarImage src={entry.avatar_url} alt={name} />}
          <AvatarFallback className="bg-gradient-primary text-primary-foreground text-lg font-bold">
            {entry.initials || name.slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div className="text-2xl font-bold text-primary mb-1">#{place}</div>
        <Link to={`/member/${entry.id}`} className="font-bold text-foreground hover:text-accent transition-colors line-clamp-1">
          {name}
        </Link>
        {dept && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{dept}</p>}

        <div className="flex items-center gap-1.5 mt-3 min-h-[28px]">
          {entry.badges.slice(0, 4).map((b) => (
            <BadgeIcon key={b.id} badgeKey={b.key} size="sm" />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 w-full mt-4 pt-4 border-t border-border">
          <Stat label="📚" value={entry.publications_count} />
          <Stat label="🏆" value={entry.awards_count} />
          <Stat label="🎯" value={entry.events_count} />
        </div>

        <Badge variant="default" className="mt-3 text-xs">
          {entry.score} pts
        </Badge>
      </div>
    </Card>
  );
};

const RowCard = ({
  entry,
  place,
  isAr,
  Arrow,
}: {
  entry: LeaderboardEntry;
  place: number;
  isAr: boolean;
  Arrow: typeof ArrowLeft;
}) => {
  const name = isAr ? entry.name_ar : entry.name_en || entry.name_ar;
  const dept = entry.department ? (isAr ? entry.department.name_ar : entry.department.name_en) : "";

  return (
    <Card className="p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className="w-10 text-center text-lg font-bold text-muted-foreground shrink-0">#{place}</div>
      <Avatar className="h-12 w-12 shrink-0">
        {entry.avatar_url && <AvatarImage src={entry.avatar_url} alt={name} />}
        <AvatarFallback className="bg-gradient-primary text-primary-foreground font-bold">
          {entry.initials || name.slice(0, 2)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <Link to={`/member/${entry.id}`} className="font-semibold text-foreground hover:text-accent transition-colors line-clamp-1">
          {name}
        </Link>
        {dept && <p className="text-xs text-muted-foreground line-clamp-1">{dept}</p>}
      </div>
      <div className="hidden sm:flex items-center gap-1">
        {entry.badges.slice(0, 3).map((b) => (
          <BadgeIcon key={b.id} badgeKey={b.key} size="sm" />
        ))}
      </div>
      <div className="hidden md:grid grid-cols-3 gap-4 text-center text-sm">
        <MiniStat icon="📚" value={entry.publications_count} />
        <MiniStat icon="🏆" value={entry.awards_count} />
        <MiniStat icon="🎯" value={entry.events_count} />
      </div>
      <Badge variant="secondary" className="shrink-0">{entry.score} pts</Badge>
      <Button asChild size="sm" variant="ghost" className="shrink-0 hidden sm:inline-flex">
        <Link to={`/member/${entry.id}`}>
          <Arrow className="h-4 w-4" />
        </Link>
      </Button>
    </Card>
  );
};

const Stat = ({ label, value }: { label: string; value: number }) => (
  <div className="text-center">
    <div className="text-base">{label}</div>
    <div className="text-sm font-bold text-foreground">{value}</div>
  </div>
);

const MiniStat = ({ icon, value }: { icon: string; value: number }) => (
  <div className="flex items-center gap-1 text-muted-foreground">
    <span>{icon}</span>
    <span className="font-semibold text-foreground">{value}</span>
  </div>
);

export default Leaderboard;
