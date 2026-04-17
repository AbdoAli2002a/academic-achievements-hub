import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Search as SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MemberCard } from "@/components/MemberCard";
import { facultyMembers, departments } from "@/data/mockData";

const ranks = ["professor", "associate", "lecturer", "assistant"] as const;

const Search = () => {
  const { t } = useTranslation();
  const [q, setQ] = useState("");
  const [dept, setDept] = useState<string>("all");
  const [rank, setRank] = useState<string>("all");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return facultyMembers.filter((m) => {
      if (dept !== "all" && m.department !== dept) return false;
      if (rank !== "all" && m.rank !== rank) return false;
      if (!query) return true;
      return [m.nameAr, m.nameEn, m.specialtyAr, m.specialtyEn]
        .some((s) => s.toLowerCase().includes(query));
    });
  }, [q, dept, rank]);

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
          <Select value={dept} onValueChange={setDept}>
            <SelectTrigger className="h-11 md:w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("search.allDepts")}</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d.key} value={d.key}>{t(`departments.${d.key}`)}</SelectItem>
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
          {t("search.results", { count: filtered.length })}
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-16">{t("search.noResults")}</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => <MemberCard key={m.id} member={m} />)}
        </div>
      )}
    </div>
  );
};

export default Search;
