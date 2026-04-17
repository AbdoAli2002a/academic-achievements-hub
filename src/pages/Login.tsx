import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { LogIn, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Login = () => {
  const { t } = useTranslation();

  return (
    <div className="container-academic py-12 md:py-20 animate-fade-in">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow mb-4">
            <GraduationCap className="h-7 w-7 text-primary-foreground" />
          </Link>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-2">{t("auth.loginTitle")}</h1>
          <p className="text-sm text-muted-foreground">{t("auth.loginSubtitle")}</p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            toast.info(t("auth.soon"));
          }}
          className="card-elegant p-6 md:p-8 space-y-5"
        >
          <div className="space-y-2">
            <Label htmlFor="email">{t("auth.email")}</Label>
            <Input id="email" type="email" required dir="ltr" autoComplete="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t("auth.password")}</Label>
            <Input id="password" type="password" required autoComplete="current-password" />
          </div>
          <Button type="submit" className="w-full gap-2">
            <LogIn className="h-4 w-4" /> {t("auth.submit")}
          </Button>
          <p className="text-xs text-muted-foreground text-center pt-2 leading-relaxed">
            {t("auth.note")}
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
