import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Mail, Phone, FileText, QrCode, BookOpen, Award, Calendar, GraduationCap, Loader2, Globe, ExternalLink } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BadgeIcon } from "@/components/BadgeIcon";
import { PublicationReviews } from "@/components/PublicationReviews";
import { fetchMemberFullProfile } from "@/lib/api";
import { toast } from "sonner";

const initialsFromName = (name: string | null | undefined) => {
  if (!name) return "؟";
  const words = name.trim().split(/\s+/);
  return words.slice(0, 2).map((w) => w[0]).join("");
};

const MemberProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const Arrow = isAr ? ArrowRight : ArrowLeft;

  const { data: member, isLoading } = useQuery({
    queryKey: ["member", id],
    queryFn: () => fetchMemberFullProfile(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="container-academic py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>;
  }

  if (!member) {
    return (
      <div className="container-academic py-20 text-center">
        <p className="text-muted-foreground mb-4">عضو هيئة التدريس غير موجود</p>
        <Button asChild><Link to="/search">{t("common.backHome")}</Link></Button>
      </div>
    );
  }

  const name = isAr ? member.name_ar : (member.name_en || member.name_ar);
  const specialty = isAr ? member.specialty_ar : (member.specialty_en || member.specialty_ar);
  const bio = isAr ? member.bio_ar : (member.bio_en || member.bio_ar);
  const deptName = member.department ? (isAr ? member.department.name_ar : member.department.name_en) : null;

  // Build timeline from publications/awards/certificates/events
  const timeline = [
    ...member.awards.map((a) => ({ year: a.year, type: "award" as const, title: isAr ? a.title_ar : (a.title_en || a.title_ar) })),
    ...member.publications.map((p) => ({ year: p.publication_year, type: "publication" as const, title: isAr ? p.title_ar : (p.title_en || p.title_ar) })),
    ...member.certificates.map((c) => ({ year: c.year, type: "certificate" as const, title: isAr ? c.title_ar : (c.title_en || c.title_ar) })),
    ...member.events.map((e) => ({ year: new Date(e.event_date).getFullYear(), type: "event" as const, title: isAr ? e.title_ar : (e.title_en || e.title_ar) })),
  ].sort((a, b) => b.year - a.year);

  const TYPE_ICON = { publication: BookOpen, award: Award, event: Calendar, certificate: GraduationCap };

  const handleSoon = () => toast.info(t("common.soon"), { description: "سيتم تفعيل هذه الميزة في المرحلة القادمة." });

  return (
    <div className="animate-fade-in">
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
        <div className="card-elegant p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Avatar className="h-28 w-28 md:h-32 md:w-32 ring-4 ring-background shadow-elegant shrink-0 -mt-16 md:mt-0">
              {member.avatar_url && <AvatarImage src={member.avatar_url} alt={name} />}
              <AvatarFallback className="bg-gradient-primary text-primary-foreground text-3xl font-bold">
                {member.initials || initialsFromName(name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {member.rank && <Badge variant="secondary" className="bg-accent-soft text-accent border-0">{t(`ranks.${member.rank}`)}</Badge>}
                {deptName && <Badge variant="outline">{deptName}</Badge>}
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold mb-2">{name}</h1>
              {specialty && <p className="text-accent font-medium mb-4">{specialty}</p>}

              {member.badges.length > 0 && (
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  {member.badges.map((b) => (
                    <BadgeIcon key={b.id} badgeKey={b.key} badgeNameAr={b.name_ar} badgeNameEn={b.name_en} iconName={b.icon} size="md" showLabel />
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
          <div className="lg:col-span-2 space-y-6">
            {bio && (
              <Section title={t("member.bio")}>
                <p className="text-muted-foreground leading-relaxed">{bio}</p>
              </Section>
            )}

            {member.publications.length > 0 && (
              <Section title={t("member.publications")}>
                <ul className="space-y-4">
                  {member.publications.map((p) => {
                    const title = isAr ? p.title_ar : (p.title_en || p.title_ar);
                    return (
                      <li key={p.id} className="rounded-lg border border-border/60 bg-card p-4">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground">{title}</p>
                            <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                              <span>{p.publication_year}</span>
                              {p.journal_name && <span>· {p.journal_name}</span>}
                              {p.type && <Badge variant="outline" className="text-[10px]">{t(`pub.${p.type}`, p.type)}</Badge>}
                            </div>
                            {p.abstract && (
                              <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{p.abstract}</p>
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
                        <PublicationReviews publicationId={p.id} publicationOwnerId={member.id} />
                      </li>
                    );
                  })}
                </ul>
              </Section>
            )}

            <Section title={t("member.achievements")}>
              {timeline.length === 0 ? (
                <p className="text-sm text-muted-foreground">لا توجد إنجازات منشورة بعد.</p>
              ) : (
                <ol className="relative border-s-2 border-accent/30 ms-2 space-y-6 pt-2">
                  {timeline.map((ev, i) => {
                    const Icon = TYPE_ICON[ev.type];
                    return (
                      <li key={i} className="ms-6 relative">
                        <span className="absolute -start-[2.05rem] flex h-8 w-8 items-center justify-center rounded-full bg-gradient-primary ring-4 ring-background shadow-md">
                          <Icon className="h-4 w-4 text-primary-foreground" />
                        </span>
                        <div className="card-elegant p-4">
                          <span className="text-xs font-bold text-accent">{ev.year}</span>
                          <p className="font-medium mt-1">{ev.title}</p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </Section>
          </div>

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
                {member.website_url && (
                  <li className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-accent shrink-0" />
                    <a href={member.website_url} target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-accent transition-colors break-all" dir="ltr">{member.website_url}</a>
                  </li>
                )}
              </ul>
            </Section>

            <div className="card-elegant p-6">
              <h3 className="font-bold mb-4">إحصائيات</h3>
              <div className="grid grid-cols-2 gap-3">
                <Stat value={member.publications.length} label={t("member.publications")} />
                <Stat value={member.awards.length} label={t("member.awards")} />
                <Stat value={member.certificates.length} label="شهادات" />
                <Stat value={member.years_exp ?? 0} label={t("member.yearsExp")} />
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
