import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, GraduationCap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // sign in
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // sign up
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupNameAr, setSignupNameAr] = useState("");
  const [signupNameEn, setSignupNameEn] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("تم تسجيل الدخول بنجاح");
      navigate("/dashboard");
    } catch (err: any) {
      const msg = err?.message ?? "خطأ في تسجيل الدخول";
      toast.error(msg.includes("Invalid login credentials") ? "بيانات الدخول غير صحيحة" : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          emailRedirectTo: redirectUrl,
          data: { name_ar: signupNameAr, name_en: signupNameEn || signupNameAr },
        },
      });
      if (error) throw error;
      toast.success("تم إنشاء الحساب! يمكنك تسجيل الدخول الآن.");
      setEmail(signupEmail);
    } catch (err: any) {
      const msg = err?.message ?? "خطأ في إنشاء الحساب";
      if (msg.includes("already registered")) toast.error("هذا البريد مسجل مسبقاً");
      else toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-academic py-12 md:py-16 animate-fade-in">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow mb-4">
            <GraduationCap className="h-7 w-7 text-primary-foreground" />
          </Link>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-2">{t("auth.loginTitle")}</h1>
          <p className="text-sm text-muted-foreground">{t("auth.loginSubtitle")}</p>
        </div>

        <Tabs defaultValue="signin" className="card-elegant p-6 md:p-8">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="signin">دخول</TabsTrigger>
            <TabsTrigger value="signup">حساب جديد</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input id="email" type="email" required dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
              </div>
              <Button type="submit" disabled={loading} className="w-full gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                {t("auth.submit")}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name-ar">الاسم بالعربية</Label>
                <Input id="name-ar" type="text" required value={signupNameAr} onChange={(e) => setSignupNameAr(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name-en">Name (English)</Label>
                <Input id="name-en" type="text" dir="ltr" value={signupNameEn} onChange={(e) => setSignupNameEn(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">{t("auth.email")}</Label>
                <Input id="signup-email" type="email" required dir="ltr" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">{t("auth.password")} (6+ أحرف)</Label>
                <Input id="signup-password" type="password" required minLength={6} value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} />
              </div>
              <Button type="submit" disabled={loading} className="w-full gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                إنشاء الحساب
              </Button>
              <p className="text-xs text-muted-foreground text-center pt-2 leading-relaxed">
                الحسابات الجديدة تُنشأ بصلاحية زائر. الإدارة تمنح صلاحية عضو هيئة التدريس.
              </p>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Login;
