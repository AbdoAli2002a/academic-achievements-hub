import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, Mail, Phone, FileText, QrCode, BookOpen, Award, Calendar, GraduationCap } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BadgeIcon } from "@/components/BadgeIcon";
import { getMemberById } from "@/data/mockData";
import { toast } from "sonner";

const TYPE_ICON = {
  publication: BookOpen,
  award: Award,
  event: Calendar,
  certificate: GraduationCap,
};

const MemberProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const Arrow = isAr ? ArrowRight : ArrowLeft;
  const member = id ? getMemberById(id) : undefined;

  if (!member) {
    return (
      <div className="container-academic py-20 text-center">
        <p className="text-muted-foreground mb-4">Member not found</p>
        <Button asChild><Link to="/search">{t("common.backHome")}</Link></Button>
      </div>
    );
  }

  const name = isAr ? member.nameAr : member.nameEn;
  const specialty = isAr ? member.specialtyAr : member.specialtyEn;
  const bio = isAr ? member.bioAr : member.bioEn;

  const handleSoon = () => toast.info(t("common.soon"), { description: "سيتم تفعيل هذه الميزة في المرحلة القادمة." });

  return (
    <div className="animate-fade-in">
      {/* Header banner */}
      <section className="relative bg-gradient-hero pt-12 pb-24 md:pt-16 md:pb-32">
        <div className="container-academic">
          <Button asChild variant="ghost" size="sm" className="mb-6 gap-2 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground">
            <Link to="/search">
              <Arrow className="h-4 w-4" />
              {t("nav.search")}
            </Link>
          </Button>
        </div>
      </section>

      <div className="container-academic -mt-20 md:-mt-24 relative z-10 pb-16">
        {/* Identity card */}
        <div className="card-elegant p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Avatar className="h-28 w-28 md:h-32 md:w-32 ring-4 ring-background shadow-elegant shrink-0 -mt-16 md:mt-0">
              <AvatarFallback className="bg-gradient-primary text-primary-foreground text-3xl font-bold">
                {member.initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="secondary" className="bg-accent-soft text-accent border-0">{t(`ranks.${member.rank}`)}</Badge>
                <Badge variant="outline">{t(`departments.${member.department}`)}</Badge>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold mb-2">{name}</h1>
              <p className="text-accent font-medium mb-4">{specialty}</p>

              {member.badges.length > 0 && (
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  {member.badges.map((b) => (
                    <BadgeIcon key={b} badge={b} size="md" showLabel />
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <Button onClick={handleSoon} className="gap-2">
                  <FileText className="h-4 w-4" /> {t("member.downloadCV")}
                </Button>
                <Button onClick={handleSoon} variant="outline" className="gap-2">
                  <QrCode className="h-4 w-4" /> {t("member.downloadQR")}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left col */}
          <div className="lg:col-span-2 space-y-6">
            <Section title={t("member.bio")}>
              <p className="text-muted-foreground leading-relaxed">{bio}</p>
            </Section>

            <Section title={t("member.achievements")}>
              <ol className="relative border-s-2 border-accent/30 ms-2 space-y-6 pt-2">
                {member.timeline.map((ev, i) => {
                  const Icon = TYPE_ICON[ev.type];
                  return (
                    <li key={i} className="ms-6 relative">
                      <span className="absolute -start-[2.05rem] flex h-8 w-8 items-center justify-center rounded-full bg-gradient-primary ring-4 ring-background shadow-md">
                        <Icon className="h-4 w-4 text-primary-foreground" />
                      </span>
                      <div className="card-elegant p-4">
                        <span className="text-xs font-bold text-accent">{ev.year}</span>
                        <p className="font-medium mt-1">{isAr ? ev.titleAr : ev.titleEn}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </Section>
          </div>

          {/* Right col */}
          <aside className="space-y-6">
            <Section title={t("member.contact")}>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-accent shrink-0" />
                  <a href={`mailto:${member.email}`} className="text-foreground hover:text-accent transition-colors break-all">{member.email}</a>
                </li>
                {member.phone && (
                  <li className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-accent shrink-0" />
                    <span className="text-foreground" dir="ltr">{member.phone}</span>
                  </li>
                )}
              </ul>
            </Section>

            <div className="card-elegant p-6">
              <h3 className="font-bold mb-4">{t("stats.publications")}</h3>
              <div className="grid grid-cols-2 gap-3">
                <Stat value={member.publicationsCount} label={t("member.publications")} />
                <Stat value={member.citationsCount} label={t("member.citations")} />
                <Stat value={member.awardsCount} label={t("member.awards")} />
                <Stat value={member.yearsExp} label={t("member.yearsExp")} />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="card-elegant p-6">
    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
      <span className="inline-block h-1.5 w-6 rounded-full bg-gradient-primary" />
      {title}
    </h2>
    {children}
  </div>
);

const Stat = ({ value, label }: { value: number; label: string }) => (
  <div className="rounded-lg bg-accent-soft/50 p-3 text-center">
    <div className="text-xl font-extrabold text-primary">{value}</div>
    <div className="text-[11px] text-muted-foreground mt-0.5">{label}</div>
  </div>
);

export default MemberProfile;
