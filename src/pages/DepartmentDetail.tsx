import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MemberCard } from "@/components/MemberCard";
import { departments, getMembersByDepartment, type DepartmentKey } from "@/data/mockData";

const DepartmentDetail = () => {
  const { key } = useParams<{ key: string }>();
  const { t, i18n } = useTranslation();
  const Arrow = i18n.language === "ar" ? ArrowRight : ArrowLeft;

  const dept = departments.find((d) => d.key === key);
  if (!dept) {
    return (
      <div className="container-academic py-20 text-center">
        <p className="text-muted-foreground mb-4">Department not found</p>
        <Button asChild><Link to="/departments">{t("common.backHome")}</Link></Button>
      </div>
    );
  }

  const members = getMembersByDepartment(dept.key as DepartmentKey);

  return (
    <div className="container-academic py-12 md:py-16 animate-fade-in">
      <Button asChild variant="ghost" size="sm" className="mb-6 gap-2">
        <Link to="/departments">
          <Arrow className="h-4 w-4" />
          {t("nav.departments")}
        </Link>
      </Button>

      <div className="card-elegant p-8 mb-10 bg-gradient-to-br from-card to-accent-soft/30">
        <div className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${dept.color} mb-4`}>
          <Building2 className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold mb-2">{t(`departments.${dept.key}`)}</h1>
        <p className="text-muted-foreground">
          {t("departments.membersCount", { count: members.length })}
        </p>
      </div>

      {members.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">{t("search.noResults")}</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {members.map((m) => <MemberCard key={m.id} member={m} />)}
        </div>
      )}
    </div>
  );
};

export default DepartmentDetail;
