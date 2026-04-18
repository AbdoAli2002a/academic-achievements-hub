import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, Award, FileCheck, Clock, Building2, GraduationCap } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  fetchAdminStats,
  fetchMembersByDepartment,
  fetchPublicationsByYear,
} from "@/lib/adminApi";

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444", "#06b6d4"];

const StatCard = ({
  icon: Icon,
  label,
  value,
  tone = "primary",
}: {
  icon: any;
  label: string;
  value: number | string;
  tone?: "primary" | "accent" | "warning";
}) => {
  const toneClass =
    tone === "warning"
      ? "bg-amber-500/10 text-amber-600"
      : tone === "accent"
      ? "bg-accent-soft text-accent"
      : "bg-primary/10 text-primary";
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${toneClass}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <div className="text-2xl font-extrabold leading-none">{value}</div>
          <div className="text-xs text-muted-foreground mt-1">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export const AdminOverview = () => {
  const { data: stats } = useQuery({ queryKey: ["admin-stats"], queryFn: fetchAdminStats });
  const { data: byYear = [] } = useQuery({
    queryKey: ["pubs-by-year"],
    queryFn: fetchPublicationsByYear,
  });
  const { data: byDept = [] } = useQuery({
    queryKey: ["members-by-dept"],
    queryFn: fetchMembersByDepartment,
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users} label="إجمالي الأعضاء" value={stats?.members ?? "—"} />
        <StatCard icon={BookOpen} label="أبحاث معتمدة" value={stats?.publications ?? "—"} tone="accent" />
        <StatCard icon={Award} label="جوائز معتمدة" value={stats?.awards ?? "—"} tone="accent" />
        <StatCard icon={FileCheck} label="شهادات معتمدة" value={stats?.certificates ?? "—"} tone="accent" />
        <StatCard icon={GraduationCap} label="فعاليات" value={stats?.events ?? "—"} />
        <StatCard icon={Building2} label="أقسام أكاديمية" value={stats?.departments ?? "—"} />
        <StatCard icon={Clock} label="بانتظار المراجعة" value={stats?.pendingPublications ?? 0} tone="warning" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">الأبحاث المعتمدة حسب السنة</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {byYear.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                لا توجد بيانات بعد
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byYear}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">الأعضاء حسب القسم</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {byDept.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                لا توجد بيانات بعد
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byDept}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(e) => `${e.name} (${e.value})`}
                  >
                    {byDept.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
