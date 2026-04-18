import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, ShieldCheck, LayoutDashboard, Users, ClipboardCheck, Award, BarChart3 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { UsersManager } from "@/components/admin/UsersManager";
import { ApprovalManager } from "@/components/admin/ApprovalManager";
import { BadgesManager } from "@/components/admin/BadgesManager";

const Admin = () => {
  const navigate = useNavigate();
  const { user, roles, loading } = useAuth();
  const isAdmin = roles.includes("super_admin");

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

  if (!isAdmin) {
    return (
      <div className="container-academic py-12">
        <div className="card-elegant p-10 text-center max-w-lg mx-auto">
          <ShieldCheck className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h2 className="text-xl font-bold mb-2">غير مصرّح</h2>
          <p className="text-sm text-muted-foreground mb-4">
            هذه الصفحة مخصّصة لمدير النظام (Super Admin) فقط.
          </p>
          <Button onClick={() => navigate("/dashboard")} variant="outline">العودة للوحة التحكم</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-academic py-8 md:py-12 animate-fade-in">
      <div className="card-elegant p-6 md:p-8 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
            <ShieldCheck className="h-7 w-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">لوحة الإدارة</h1>
            <p className="text-sm text-muted-foreground">
              إدارة المستخدمين، مراجعة المحتوى، الأوسمة، والإحصائيات
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto p-1">
          <TabsTrigger value="overview" className="gap-1.5 text-xs md:text-sm py-2">
            <BarChart3 className="h-4 w-4" /> نظرة عامة
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-1.5 text-xs md:text-sm py-2">
            <Users className="h-4 w-4" /> المستخدمون
          </TabsTrigger>
          <TabsTrigger value="approvals" className="gap-1.5 text-xs md:text-sm py-2">
            <ClipboardCheck className="h-4 w-4" /> المراجعة
          </TabsTrigger>
          <TabsTrigger value="badges" className="gap-1.5 text-xs md:text-sm py-2">
            <Award className="h-4 w-4" /> الأوسمة
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6"><AdminOverview /></TabsContent>
        <TabsContent value="users" className="mt-6"><UsersManager /></TabsContent>
        <TabsContent value="approvals" className="mt-6"><ApprovalManager /></TabsContent>
        <TabsContent value="badges" className="mt-6"><BadgesManager /></TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
