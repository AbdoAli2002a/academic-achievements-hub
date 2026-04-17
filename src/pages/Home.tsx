import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ArrowLeft, FileText, QrCode, Award, Clock, Search, Sparkles, BookOpen, Users, Building2, Trophy, Loader2 } from "lucide-react";
import * as Icons from "lucide-react";
import { Button } from "@/components/ui/button";
import { MemberCard } from "@/components/MemberCard";
import { fetchActiveMembers, fetchDepartments, fetchPlatformStats } from "@/lib/api";
import heroImg from "@/assets/hero-academic.jpg";

const Home = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  const { data: stats } = useQuery({ queryKey: ["stats"], queryFn: fetchPlatformStats });
  const { data: depts = [] } = useQuery({ queryKey: ["departments"], queryFn: fetchDepartments });
  const { data: featured = [], isLoading: loadingFeatured } = useQuery({
    queryKey: ["members", "featured"],
    queryFn: () => fetchActiveMembers({ limit: 6 }),
  });

  const statsArr = [
    { value: stats?.members ?? 0, label: t("stats.members"), icon: Users },
    { value: stats?.publications ?? 0, label: t("stats.publications"), icon: BookOpen },
    { value: stats?.departments ?? 0, label: t("stats.departments"), icon: Building2 },
    { value: stats?.awards ?? 0, label: t("stats.awards"), icon: Trophy },
  ];

  const features = [
    { key: "cv", icon: FileText },
    { key: "qr", icon: QrCode },
    { key: "timeline", icon: Clock },
    { key: "badges", icon: Award },
  ] as const;

  return (
    <div className="animate-fade-in">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-95" />
        <img
          src={heroImg}
          alt="Faculty"
          width={1920}
          height={1080}
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40"
        />
        <div className="relative container-academic py-20 md:py-28 lg:py-36">
          <div className="max-w-3xl mx-auto text-center text-primary-foreground animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              {t("hero.badge")}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              {t("hero.title")}{" "}
              <span className="block mt-2 bg-gradient-to-r from-gold to-gold/80 bg-clip-text text-transparent">
                {t("hero.titleAccent")}
              </span>
            </h1>
            <p className="text-base md:text-lg text-primary-foreground/90 leading-relaxed mb-8 max-w-2xl mx-auto">
              {t("hero.subtitle")}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="bg-gold text-gold-foreground hover:bg-gold/90 shadow-gold gap-2">
                <Link to="/departments">
                  {t("hero.ctaExplore")}
                  <Arrow className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-white/10 text-primary-foreground border-white/30 hover:bg-white/20 hover:text-primary-foreground gap-2 backdrop-blur-sm">
                <Link to="/search">
                  <Search className="h-4 w-4" />
                  {t("hero.ctaSearch")}
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="relative">
          <svg viewBox="0 0 1440 80" className="w-full h-12 fill-background block" preserveAspectRatio="none" aria-hidden>
            <path d="M0,40 C320,80 720,0 1440,40 L1440,80 L0,80 Z" />
          </svg>
        </div>
      </section>

      {/* STATS */}
      <section className="container-academic -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statsArr.map((s) => (
            <div key={s.label} className="card-elegant p-5 text-center animate-scale-in">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft mb-3">
                <s.icon className="h-5 w-5 text-accent" />
              </div>
              <div className="text-2xl md:text-3xl font-extrabold text-gradient-primary">
                {s.value.toLocaleString(isAr ? "ar-EG" : "en-US")}
              </div>
              <div className="text-xs md:text-sm text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* DEPARTMENTS */}
      <section className="container-academic py-20">
        <SectionHeader title={t("sections.departmentsTitle")} subtitle={t("sections.departmentsSubtitle")} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {depts.map((d) => {
            const Icon = (Icons as any)[d.icon ?? "Building2"] ?? Building2;
            return (
              <Link
                key={d.id}
                to={`/departments/${d.key}`}
                className="card-elegant group p-6 hover:border-accent/50"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${d.color_class} mb-4`}>
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-1.5">{isAr ? d.name_ar : d.name_en}</h3>
                <div className="flex items-center gap-1.5 mt-4 text-sm font-medium text-accent">
                  {t("common.viewAll")}
                  <Arrow className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-muted/40 py-20">
        <div className="container-academic">
          <SectionHeader title={t("sections.featuresTitle")} subtitle={t("sections.featuresSubtitle")} />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.key} className="card-elegant p-6 text-center">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow mb-4">
                  <f.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <h3 className="font-bold mb-2">{t(`features.${f.key}.title`)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(`features.${f.key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED MEMBERS */}
      <section className="container-academic py-20">
        <SectionHeader title={t("sections.featuredTitle")} subtitle={t("sections.featuredSubtitle")} />
        {loadingFeatured ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>
        ) : featured.length === 0 ? (
          <div className="text-center text-muted-foreground py-12 card-elegant">
            <p className="mb-2">لا يوجد أعضاء هيئة تدريس مسجلين بعد.</p>
            <p className="text-sm">سيتم عرضهم هنا بمجرد إضافتهم من لوحة الإدارة.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured.slice(0, 3).map((m) => <MemberCard key={m.id} member={m} />)}
          </div>
        )}
        <div className="text-center mt-10">
          <Button asChild size="lg" variant="outline" className="gap-2">
            <Link to="/search">
              {t("common.viewAll")}
              <Arrow className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

const SectionHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="text-center mb-12 max-w-2xl mx-auto">
    <h2 className="text-3xl md:text-4xl font-extrabold mb-3 text-gradient-primary">{title}</h2>
    <p className="text-muted-foreground">{subtitle}</p>
  </div>
);

export default Home;
