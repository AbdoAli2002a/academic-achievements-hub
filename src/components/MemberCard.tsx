import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Mail, ArrowLeft, ArrowRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BadgeIcon } from "./BadgeIcon";
import type { MemberWithRelations } from "@/lib/api";

interface Props {
  member: MemberWithRelations;
}

const initialsFromName = (name: string | null | undefined) => {
  if (!name) return "؟";
  const words = name.trim().split(/\s+/);
  return words.slice(0, 2).map((w) => w[0]).join("");
};

export const MemberCard = ({ member }: Props) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const name = isAr ? member.name_ar : (member.name_en || member.name_ar);
  const specialty = isAr ? member.specialty_ar : (member.specialty_en || member.specialty_ar);
  const deptName = member.department ? (isAr ? member.department.name_ar : member.department.name_en) : "";
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  return (
    <article className="card-elegant group relative overflow-hidden p-6 flex flex-col">
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-primary" />

      <div className="flex items-start gap-4 mb-4">
        <Avatar className="h-16 w-16 ring-2 ring-accent/20">
          {member.avatar_url && <AvatarImage src={member.avatar_url} alt={name} />}
          <AvatarFallback className="bg-gradient-primary text-primary-foreground text-lg font-bold">
            {member.initials || initialsFromName(name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg leading-tight text-foreground line-clamp-1">{name}</h3>
          {member.rank && <p className="text-xs text-accent font-medium mt-1">{t(`ranks.${member.rank}`)}</p>}
          {deptName && <p className="text-xs text-muted-foreground mt-0.5">{deptName}</p>}
        </div>
      </div>

      {specialty && (
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 min-h-[2.5rem]">
          {specialty}
        </p>
      )}

      {member.badges.length > 0 && (
        <div className="flex items-center gap-1.5 mb-4">
          {member.badges.slice(0, 3).map((b) => (
            <BadgeIcon key={b.id} badgeKey={b.key} size="sm" />
          ))}
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 mb-5 pt-4 border-t border-border">
        <Stat value={member.publications_count} label={t("member.publications")} />
        <Stat value={member.awards_count} label={t("member.awards")} />
        <Stat value={member.years_exp ?? 0} label={t("member.yearsExp")} />
      </div>

      <div className="flex items-center gap-2 mt-auto">
        <Button asChild size="sm" className="flex-1 gap-2">
          <Link to={`/member/${member.id}`}>
            {t("member.viewProfile")}
            <Arrow className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
          </Link>
        </Button>
        {member.email && (
          <Button asChild size="sm" variant="outline" aria-label="Email">
            <a href={`mailto:${member.email}`}>
              <Mail className="h-4 w-4" />
            </a>
          </Button>
        )}
      </div>
    </article>
  );
};

const Stat = ({ value, label }: { value: number; label: string }) => (
  <div className="text-center">
    <div className="text-lg font-bold text-primary">{value}</div>
    <div className="text-[10px] text-muted-foreground leading-tight">{label}</div>
  </div>
);
