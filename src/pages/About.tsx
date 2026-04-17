import { useTranslation } from "react-i18next";
import { GraduationCap, Target, Users, Sparkles } from "lucide-react";

const About = () => {
  const { t } = useTranslation();

  const values = [
    { icon: Target, titleAr: "الرسالة", titleEn: "Our Mission", descAr: "توثيق وعرض إنجازات الكادر الأكاديمي بشكل احترافي.", descEn: "Document and showcase faculty achievements professionally." },
    { icon: Sparkles, titleAr: "الرؤية", titleEn: "Our Vision", descAr: "أن نكون منصة مرجعية للتميز الأكاديمي.", descEn: "To be a reference platform for academic excellence." },
    { icon: Users, titleAr: "القيم", titleEn: "Our Values", descAr: "الشفافية، التميز، خدمة المجتمع.", descEn: "Transparency, excellence, community service." },
  ];

  const isAr = t("nav.home") === "الرئيسية";

  return (
    <div className="animate-fade-in">
      <section className="bg-gradient-hero text-primary-foreground py-16 md:py-24">
        <div className="container-academic text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm mb-5">
            <GraduationCap className="h-8 w-8" />
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4">{t("nav.about")}</h1>
          <p className="max-w-2xl mx-auto text-primary-foreground/85 leading-relaxed">{t("app.tagline")}</p>
        </div>
      </section>

      <section className="container-academic py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {values.map((v) => (
            <div key={v.titleAr} className="card-elegant p-6 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow mb-4">
                <v.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-bold text-lg mb-2">{isAr ? v.titleAr : v.titleEn}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{isAr ? v.descAr : v.descEn}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default About;
