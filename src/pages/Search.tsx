import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Search as SearchIcon, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MemberCard } from "@/components/MemberCard";
import { fetchActiveMembers, fetchDepartments } from "@/lib/api";

const ranks = ["professor", "associate", "lecturer", "assistant"] as const;

const Search = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const [q, setQ] = useState("");
  const [deptId, setDeptId] = useState<string>("all");
  const [rank, setRank] = useState<string>("all");

  const { data: depts = [] } = useQuery({ queryKey: ["departments"], queryFn: fetchDepartments });

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["search", q, deptId, rank],
    queryFn: () =>
      fetchActiveMembers({
        departmentId: deptId === "all" ? undefined : deptId,
        rank: rank === "all" ? undefined : rank,
        query: q,
      }),
  });

  return (
    <div className="container-academic py-12 md:py-16 animate-fade-in">
      <div className="max-w-2xl mx-auto text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-3 text-gradient-primary">
          {t("search.title")}
        </h1>
      </div>

      <div className="card-elegant p-5 md:p-6 mb-8 max-w-4xl mx-auto">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <SearchIcon className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("search.placeholder")}
              className="ps-10 h-11"
            />
          </div>
          <Select value={deptId} onValueChange={setDeptId}>
            <SelectTrigger className="h-11 md:w-[200px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("search.allDepts")}</SelectItem>
              {depts.map((d) => (
                <SelectItem key={d.id} value={d.id}>{isAr ? d.name_ar : d.name_en}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={rank} onValueChange={setRank}>
            <SelectTrigger className="h-11 md:w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("search.allRanks")}</SelectItem>
              {ranks.map((r) => (
                <SelectItem key={r} value={r}>{t(`ranks.${r}`)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          {isLoading ? t("common.loading") : t("search.results", { count: members.length })}
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>
      ) : members.length === 0 ? (
        <p className="text-center text-muted-foreground py-16">{t("search.noResults")}</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {members.map((m) => <MemberCard key={m.id} member={m} />)}
        </div>
      )}
    </div>
  );
};

export default Search;
