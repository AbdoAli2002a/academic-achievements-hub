import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  ExternalLink,
  Star,
  BookOpen,
  Quote,
  Search,
  X,
  Download,
  FileText,
  FileSpreadsheet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PublicationReviews } from "@/components/PublicationReviews";
import { fetchPublicationsRatings } from "@/lib/reviewsApi";
import { exportPublicationsCsv, exportPublicationsPdf } from "@/lib/publicationsExport";
import { toast } from "sonner";
import type { Publication } from "@/lib/api";

interface Props {
  publications: Publication[];
  ownerId: string;
  ownerName?: string;
}

type SortKey = "newest" | "oldest" | "topRated" | "mostCited";
type FilterType = "all" | "journal" | "conference" | "book" | "chapter" | "thesis" | "other";

export const PublicationsList = ({ publications, ownerId, ownerName }: Props) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const [sort, setSort] = useState<SortKey>("newest");
  const [type, setType] = useState<FilterType>("all");
  const [query, setQuery] = useState("");

  const ids = useMemo(() => publications.map((p) => p.id), [publications]);

  const { data: ratingsMap } = useQuery({
    queryKey: ["publications-ratings", ids],
    queryFn: () => fetchPublicationsRatings(ids),
    enabled: ids.length > 0,
  });

  const filtered = useMemo(() => {
    let arr = type === "all" ? [...publications] : publications.filter((p) => p.type === type);
    const q = query.trim().toLowerCase();
    if (q) {
      arr = arr.filter((p) => {
        const haystack = [
          p.title_ar,
          p.title_en,
          p.abstract,
          p.journal_name,
          p.publisher,
          p.authors,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      });
    }
    arr.sort((a, b) => {
      switch (sort) {
        case "newest":
          return (b.publication_year ?? 0) - (a.publication_year ?? 0);
        case "oldest":
          return (a.publication_year ?? 0) - (b.publication_year ?? 0);
        case "mostCited":
          return (b.citations_count ?? 0) - (a.citations_count ?? 0);
        case "topRated": {
          const ra = ratingsMap?.get(a.id);
          const rb = ratingsMap?.get(b.id);
          // sort by avg, then count, then year
          const avgA = ra?.average ?? 0;
          const avgB = rb?.average ?? 0;
          if (avgB !== avgA) return avgB - avgA;
          const cA = ra?.count ?? 0;
          const cB = rb?.count ?? 0;
          if (cB !== cA) return cB - cA;
          return (b.publication_year ?? 0) - (a.publication_year ?? 0);
        }
      }
    });
    return arr;
  }, [publications, type, sort, ratingsMap, query]);

  const TYPE_OPTIONS: FilterType[] = ["all", "journal", "conference", "book", "chapter", "thesis", "other"];

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("pubFilter.searchPlaceholder")}
          className="ps-9 pe-9 h-9"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label={t("pubFilter.clearSearch")}
            className="absolute top-1/2 -translate-y-1/2 end-2 p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Filters / sort bar */}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
          <SelectTrigger className="w-auto min-w-[160px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">{t("pubFilter.newest")}</SelectItem>
            <SelectItem value="oldest">{t("pubFilter.oldest")}</SelectItem>
            <SelectItem value="topRated">{t("pubFilter.topRated")}</SelectItem>
            <SelectItem value="mostCited">{t("pubFilter.mostCited")}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={type} onValueChange={(v) => setType(v as FilterType)}>
          <SelectTrigger className="w-auto min-w-[140px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map((tp) => (
              <SelectItem key={tp} value={tp}>
                {tp === "all" ? t("pubFilter.allTypes") : t(`pub.${tp}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-xs text-muted-foreground ms-auto">
          {filtered.length} / {publications.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          {t("pubFilter.noResults")}
        </p>
      ) : (
        <ul className="space-y-4">
          {filtered.map((p) => {
            const title = isAr ? p.title_ar : p.title_en || p.title_ar;
            const r = ratingsMap?.get(p.id);
            return (
              <li key={p.id} className="rounded-lg border border-border/60 bg-card p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground">{title}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>{p.publication_year}</span>
                      {p.journal_name && <span>· {p.journal_name}</span>}
                      {p.type && (
                        <Badge variant="outline" className="text-[10px]">
                          {t(`pub.${p.type}`, p.type)}
                        </Badge>
                      )}
                      {r && r.count > 0 && (
                        <span className="inline-flex items-center gap-1 text-foreground">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span className="font-bold">{r.average.toFixed(1)}</span>
                          <span className="text-muted-foreground">({r.count})</span>
                        </span>
                      )}
                      {(p.citations_count ?? 0) > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <Quote className="h-3 w-3" />
                          {p.citations_count}
                        </span>
                      )}
                    </div>
                    {p.abstract && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                        {p.abstract}
                      </p>
                    )}
                  </div>
                  {p.url && (
                    <Button asChild variant="ghost" size="sm" className="gap-1">
                      <a href={p.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3.5 w-3.5" /> {t("member.openLink")}
                      </a>
                    </Button>
                  )}
                </div>
                <PublicationReviews publicationId={p.id} publicationOwnerId={ownerId} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
