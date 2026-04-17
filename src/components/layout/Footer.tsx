import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { GraduationCap, Mail, MapPin, Phone } from "lucide-react";

export const Footer = () => {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-gradient-to-b from-background to-muted/30 mt-20">
      <div className="container-academic py-12">
        <div className="grid gap-10 md:grid-cols-3">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <div className="font-bold">{t("app.name")}</div>
                <div className="text-xs text-muted-foreground">{t("app.faculty")}</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("footer.description")}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4">{t("footer.quickLinks")}</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/" className="text-muted-foreground hover:text-accent transition-colors">{t("nav.home")}</Link></li>
              <li><Link to="/departments" className="text-muted-foreground hover:text-accent transition-colors">{t("nav.departments")}</Link></li>
              <li><Link to="/search" className="text-muted-foreground hover:text-accent transition-colors">{t("nav.search")}</Link></li>
              <li><Link to="/about" className="text-muted-foreground hover:text-accent transition-colors">{t("nav.about")}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4">{t("footer.contact")}</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-accent shrink-0" /> {t("footer.address")}</li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-accent shrink-0" /> info@faculty.edu</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-accent shrink-0" /> +20 000 000 0000</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          © {year} {t("app.name")} — {t("footer.rights")}
        </div>
      </div>
    </footer>
  );
};
