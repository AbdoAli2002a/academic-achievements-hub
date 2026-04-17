import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import * as Icons from "lucide-react";
import { Building2, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { fetchDepartments } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";

const Departments = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  const { data: departments = [], isLoading } = useQuery({
    queryKey: ["departments-with-counts"],
    queryFn: async () => {
      const depts = await fetchDepartments();
      const withCounts = await Promise.all(
        depts.map(async (d) => {
          const { count } = await supabase
            .from("profiles")
            .select("id", { count: "exact", head: true })
            .eq("department_id", d.id)
            .eq("status", "active");
          return { ...d, members_count: count ?? 0 };
        })
      );
      return withCounts;
    },
  });

  return (
    <div className="container-academic py-12 md:py-16 animate-fade-in">
      <div className="max-w-2xl mx-auto text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-3 text-gradient-primary">
          {t("sections.departmentsTitle")}
        </h1>
        <p className="text-muted-foreground">{t("sections.departmentsSubtitle")}</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((d) => {
            const Icon = (Icons as any)[d.icon ?? "Building2"] ?? Building2;
            return (
              <Link
                key={d.id}
                to={`/departments/${d.key}`}
                className="card-elegant group p-6 hover:border-accent/50"
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${d.color_class} mb-4`}>
                  <Icon className="h-7 w-7 text-primary" />
                </div>
                <h2 className="font-bold text-lg mb-1.5">{isAr ? d.name_ar : d.name_en}</h2>
                <p className="text-sm text-muted-foreground">
                  {t("departments.membersCount", { count: d.members_count })}
                </p>
                <div className="flex items-center gap-1.5 mt-4 text-sm font-medium text-accent">
                  {t("common.viewAll")}
                  <Arrow className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Departments;
