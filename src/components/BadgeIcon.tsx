import { useTranslation } from "react-i18next";
import { Award, Crown, Heart, Sparkles, BookOpen, GraduationCap, type LucideIcon } from "lucide-react";
import type { BadgeKey } from "@/data/mockData";
import { cn } from "@/lib/utils";

const ICONS: Record<BadgeKey, LucideIcon> = {
  topPublisher: BookOpen,
  communityService: Heart,
  excellence: Crown,
  research: Sparkles,
  teaching: GraduationCap,
};

interface Props {
  badge: BadgeKey;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export const BadgeIcon = ({ badge, size = "md", showLabel = false }: Props) => {
  const { t } = useTranslation();
  const Icon = ICONS[badge] ?? Award;
  const dim = size === "sm" ? "h-7 w-7" : size === "lg" ? "h-12 w-12" : "h-9 w-9";
  const iconDim = size === "sm" ? "h-3.5 w-3.5" : size === "lg" ? "h-6 w-6" : "h-4.5 w-4.5";

  return (
    <div className="inline-flex items-center gap-2" title={t(`badges.${badge}`)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-gradient-gold shadow-gold ring-2 ring-background",
          dim
        )}
      >
        <Icon className={cn("text-gold-foreground", iconDim)} />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-foreground">{t(`badges.${badge}`)}</span>
      )}
    </div>
  );
};
