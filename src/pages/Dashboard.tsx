import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { LogOut, GraduationCap, ShieldCheck, User as UserIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, roles, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="container-academic py-20 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }
  if (!user) return null;

  const isAdmin = roles.includes("super_admin");
  const isProfessor = roles.includes("professor");

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="container-academic py-12 animate-fade-in">
      <div className="max-w-3xl mx-auto">
        <div className="card-elegant p-8 mb-6">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
                <GraduationCap className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold">{t("nav.dashboard")}</h1>
                <p className="text-sm text-muted-foreground" dir="ltr">{user.email}</p>
              </div>
            </div>
            <Button onClick={handleSignOut} variant="outline" size="sm" className="gap-2">
              <LogOut className="h-4 w-4" />
              خروج
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {roles.map((r) => (
              <span key={r} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-soft text-accent text-xs font-semibold">
                {r === "super_admin" ? <ShieldCheck className="h-3.5 w-3.5" /> : <UserIcon className="h-3.5 w-3.5" />}
                {r === "super_admin" ? "مدير عام" : r === "professor" ? "عضو هيئة تدريس" : "زائر"}
              </span>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {isAdmin && (
            <div className="card-elegant p-6">
              <ShieldCheck className="h-8 w-8 text-accent mb-3" />
              <h3 className="font-bold mb-1">لوحة الإدارة</h3>
              <p className="text-sm text-muted-foreground mb-4">إدارة المستخدمين، المراجعة، الإحصائيات</p>
              <Button size="sm" disabled>قيد التطوير (المرحلة 4)</Button>
            </div>
          )}
          {isProfessor && (
            <div className="card-elegant p-6">
              <UserIcon className="h-8 w-8 text-accent mb-3" />
              <h3 className="font-bold mb-1">ملفي الأكاديمي</h3>
              <p className="text-sm text-muted-foreground mb-4">إدارة بياناتك ورفع الإنتاج العلمي</p>
              <Button size="sm" disabled>قيد التطوير (المرحلة 3)</Button>
            </div>
          )}
          {!isAdmin && !isProfessor && (
            <div className="card-elegant p-6 sm:col-span-2">
              <p className="text-sm text-muted-foreground">
                حسابك مسجّل كزائر. للحصول على صلاحيات إضافية تواصل مع إدارة الكلية.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
