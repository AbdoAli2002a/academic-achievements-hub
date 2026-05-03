import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { LogOut, GraduationCap, ShieldCheck, User as UserIcon, Loader2, FileText, BookOpen, Award, Calendar as CalendarIcon, GraduationCap as CertIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { ProfileEditor } from "@/components/dashboard/ProfileEditor";
import { ContentManager } from "@/components/dashboard/ContentManager";
import { CvAndQrPanel } from "@/components/dashboard/CvAndQrPanel";
import { DeanPanel } from "@/components/dashboard/DeanPanel";

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
  const isDean = roles.includes("dean") || isAdmin;
  const isProfessor = roles.includes("professor") || isAdmin;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="container-academic py-8 md:py-12 animate-fade-in">
      {/* Header card */}
      <div className="card-elegant p-6 md:p-8 mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
              <GraduationCap className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold">{t("nav.dashboard")}</h1>
              <p className="text-sm text-muted-foreground" dir="ltr">{user.email}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {roles.map((r) => (
                  <span key={r} className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent-soft text-accent text-xs font-semibold">
                    {r === "super_admin" ? <ShieldCheck className="h-3 w-3" /> : <UserIcon className="h-3 w-3" />}
                    {r === "super_admin" ? "مدير عام" : r === "professor" ? "عضو هيئة تدريس" : "زائر"}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {isProfessor && (
              <Button asChild variant="outline" size="sm" className="gap-2">
                <a href={`/member/${user.id}`} target="_blank" rel="noreferrer">
                  <UserIcon className="h-4 w-4" /> صفحتي العامة
                </a>
              </Button>
            )}
            <Button onClick={handleSignOut} variant="outline" size="sm" className="gap-2">
              <LogOut className="h-4 w-4" /> خروج
            </Button>
          </div>
        </div>
      </div>

      {!isProfessor ? (
        <div className="card-elegant p-8 text-center">
          <UserIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-bold mb-1">حسابك مسجّل كزائر</h3>
          <p className="text-sm text-muted-foreground">للحصول على صلاحيات إضافية تواصل مع إدارة الكلية لرفعك إلى عضو هيئة تدريس.</p>
        </div>
      ) : (
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 h-auto p-1">
            <TabsTrigger value="profile" className="gap-1.5 text-xs md:text-sm py-2"><UserIcon className="h-4 w-4" /> البروفايل</TabsTrigger>
            <TabsTrigger value="publications" className="gap-1.5 text-xs md:text-sm py-2"><BookOpen className="h-4 w-4" /> الأبحاث</TabsTrigger>
            <TabsTrigger value="awards" className="gap-1.5 text-xs md:text-sm py-2"><Award className="h-4 w-4" /> الجوائز</TabsTrigger>
            <TabsTrigger value="certificates" className="gap-1.5 text-xs md:text-sm py-2"><CertIcon className="h-4 w-4" /> الشهادات</TabsTrigger>
            <TabsTrigger value="events" className="gap-1.5 text-xs md:text-sm py-2"><CalendarIcon className="h-4 w-4" /> الفعاليات</TabsTrigger>
            <TabsTrigger value="cv" className="gap-1.5 text-xs md:text-sm py-2"><FileText className="h-4 w-4" /> CV / QR</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6"><ProfileEditor userId={user.id} /></TabsContent>
          <TabsContent value="publications" className="mt-6"><ContentManager userId={user.id} kind="publications" /></TabsContent>
          <TabsContent value="awards" className="mt-6"><ContentManager userId={user.id} kind="awards" /></TabsContent>
          <TabsContent value="certificates" className="mt-6"><ContentManager userId={user.id} kind="certificates" /></TabsContent>
          <TabsContent value="events" className="mt-6"><ContentManager userId={user.id} kind="events" /></TabsContent>
          <TabsContent value="cv" className="mt-6"><CvAndQrPanel userId={user.id} /></TabsContent>

          {isAdmin && (
            <div className="card-elegant p-6 mt-6 border-2 border-dashed border-accent/30">
              <ShieldCheck className="h-8 w-8 text-accent mb-2" />
              <h3 className="font-bold mb-1">لوحة الإدارة</h3>
              <p className="text-sm text-muted-foreground">إدارة المستخدمين والمراجعة والإحصائيات — قيد التطوير في المرحلة 4.</p>
            </div>
          )}
        </Tabs>
      )}
    </div>
  );
};

export default Dashboard;
