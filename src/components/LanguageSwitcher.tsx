import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const toggle = () => i18n.changeLanguage(isAr ? "en" : "ar");

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      className="gap-2 font-medium"
      aria-label="Switch language"
    >
      <Languages className="h-4 w-4" />
      <span>{isAr ? "EN" : "العربية"}</span>
    </Button>
  );
};
