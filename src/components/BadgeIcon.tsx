import { useTranslation } from "react-i18next";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  badgeKey: string;
  badgeNameAr?: string;
  badgeNameEn?: string;
  iconName?: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export const BadgeIcon = ({ badgeKey, badgeNameAr, badgeNameEn, iconName, size = "md", showLabel = false }: Props) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const Lucide = (iconName && (Icons as any)[iconName]) as any;
  const Icon = Lucide || (Icons as any).Award;

  // Try translated name first; fall back to DB name
  const translated = t(`badges.${badgeKey}`, { defaultValue: "" });
  const label = translated || (isAr ? badgeNameAr : badgeNameEn) || badgeKey;

  const dim = size === "sm" ? "h-7 w-7" : size === "lg" ? "h-12 w-12" : "h-9 w-9";
  const iconDim = size === "sm" ? "h-3.5 w-3.5" : size === "lg" ? "h-6 w-6" : "h-4.5 w-4.5";

  return (
    <div className="inline-flex items-center gap-2" title={label}>
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-gradient-gold shadow-gold ring-2 ring-background",
          dim
        )}
      >
        <Icon className={cn("text-gold-foreground", iconDim)} />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-foreground">{label}</span>
      )}
    </div>
  );
};
