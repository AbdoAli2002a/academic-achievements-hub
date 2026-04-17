import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Building2, ArrowRight, ArrowLeft } from "lucide-react";
import { departments, facultyMembers } from "@/data/mockData";

const Departments = () => {
  const { t, i18n } = useTranslation();
  const Arrow = i18n.language === "ar" ? ArrowLeft : ArrowRight;

  return (
    <div className="container-academic py-12 md:py-16 animate-fade-in">
      <div className="max-w-2xl mx-auto text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-3 text-gradient-primary">
          {t("sections.departmentsTitle")}
        </h1>
        <p className="text-muted-foreground">{t("sections.departmentsSubtitle")}</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {departments.map((d) => {
          const count = facultyMembers.filter((m) => m.department === d.key).length;
          return (
            <Link
              key={d.key}
              to={`/departments/${d.key}`}
              className="card-elegant group p-6 hover:border-accent/50"
            >
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${d.color} mb-4`}>
                <Building2 className="h-7 w-7 text-primary" />
              </div>
              <h2 className="font-bold text-lg mb-1.5">{t(`departments.${d.key}`)}</h2>
              <p className="text-sm text-muted-foreground">
                {t("departments.membersCount", { count })}
              </p>
              <div className="flex items-center gap-1.5 mt-4 text-sm font-medium text-accent">
                {t("common.viewAll")}
                <Arrow className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Departments;
