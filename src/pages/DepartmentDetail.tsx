import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import * as Icons from "lucide-react";
import { ArrowLeft, ArrowRight, Building2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MemberCard } from "@/components/MemberCard";
import { fetchActiveMembers, fetchDepartmentByKey } from "@/lib/api";

const DepartmentDetail = () => {
  const { key } = useParams<{ key: string }>();
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const Arrow = isAr ? ArrowRight : ArrowLeft;

  const { data: dept, isLoading: loadingDept } = useQuery({
    queryKey: ["department", key],
    queryFn: () => fetchDepartmentByKey(key!),
    enabled: !!key,
  });

  const { data: members = [], isLoading: loadingMembers } = useQuery({
    queryKey: ["members", "by-dept", dept?.id],
    queryFn: () => fetchActiveMembers({ departmentId: dept!.id }),
    enabled: !!dept?.id,
  });

  if (loadingDept) {
    return <div className="container-academic py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>;
  }

  if (!dept) {
    return (
      <div className="container-academic py-20 text-center">
        <p className="text-muted-foreground mb-4">القسم غير موجود</p>
        <Button asChild><Link to="/departments">{t("common.backHome")}</Link></Button>
      </div>
    );
  }

  const Icon = (Icons as any)[dept.icon ?? "Building2"] ?? Building2;

  return (
    <div className="container-academic py-12 md:py-16 animate-fade-in">
      <Button asChild variant="ghost" size="sm" className="mb-6 gap-2">
        <Link to="/departments">
          <Arrow className="h-4 w-4" />
          {t("nav.departments")}
        </Link>
      </Button>

      <div className="card-elegant p-8 mb-10 bg-gradient-to-br from-card to-accent-soft/30">
        <div className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${dept.color_class} mb-4`}>
          <Icon className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold mb-2">{isAr ? dept.name_ar : dept.name_en}</h1>
        <p className="text-muted-foreground">
          {t("departments.membersCount", { count: members.length })}
        </p>
      </div>

      {loadingMembers ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>
      ) : members.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">لا يوجد أعضاء مسجلون في هذا القسم بعد.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {members.map((m) => <MemberCard key={m.id} member={m} />)}
        </div>
      )}
    </div>
  );
};

export default DepartmentDetail;
