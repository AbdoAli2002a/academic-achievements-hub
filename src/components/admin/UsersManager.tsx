import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, ShieldCheck, UserCheck, UserX, Star, StarOff } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AdminUser,
  AppRole,
  fetchAdminUsers,
  setProfileFeatured,
  setUserRole,
  updateProfileStatus,
} from "@/lib/adminApi";
import { toast } from "sonner";

const roleLabel: Record<AppRole, string> = {
  super_admin: "مدير عام",
  dean: "عميد الكلية",
  professor: "هيئة تدريس",
  visitor: "زائر",
};

export const UsersManager = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: fetchAdminUsers,
  });

  const roleMut = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: AppRole }) => setUserRole(userId, role),
    onSuccess: () => {
      toast.success("تم تحديث الدور");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e: any) => toast.error(e.message ?? "فشل التحديث"),
  });

  const statusMut = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: "active" | "suspended" }) =>
      updateProfileStatus(userId, status),
    onSuccess: () => {
      toast.success("تم تحديث الحالة");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const featMut = useMutation({
    mutationFn: ({ userId, featured }: { userId: string; featured: boolean }) =>
      setProfileFeatured(userId, featured),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const filtered = users.filter((u) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      u.email?.toLowerCase().includes(q) ||
      u.profile?.name_ar?.toLowerCase().includes(q) ||
      u.profile?.name_en?.toLowerCase().includes(q)
    );
  });

  if (isLoading) {
    return (
      <div className="py-12 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Input
          placeholder="ابحث بالبريد أو الاسم…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <span className="text-xs text-muted-foreground">{filtered.length} مستخدم</span>
      </div>

      <div className="card-elegant overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th className="text-right p-3 font-medium">العضو</th>
                <th className="text-right p-3 font-medium">الدور</th>
                <th className="text-right p-3 font-medium">الحالة</th>
                <th className="text-right p-3 font-medium">مميّز</th>
                <th className="text-right p-3 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((u: AdminUser) => {
                const currentRole = (u.roles[0] ?? "visitor") as AppRole;
                const status = (u.profile?.status ?? "active") as "active" | "suspended" | "inactive";
                const featured = !!u.profile?.is_featured;
                return (
                  <tr key={u.id} className="hover:bg-muted/30">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={u.profile?.avatar_url ?? undefined} />
                          <AvatarFallback>{u.profile?.name_ar?.[0] ?? u.email?.[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold">{u.profile?.name_ar ?? "بدون اسم"}</div>
                          <div className="text-xs text-muted-foreground" dir="ltr">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <Select
                        value={currentRole}
                        onValueChange={(v) => roleMut.mutate({ userId: u.id, role: v as AppRole })}
                      >
                        <SelectTrigger className="w-36 h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="visitor">{roleLabel.visitor}</SelectItem>
                          <SelectItem value="professor">{roleLabel.professor}</SelectItem>
                          <SelectItem value="super_admin">
                            <span className="inline-flex items-center gap-1.5">
                              <ShieldCheck className="h-3.5 w-3.5" /> {roleLabel.super_admin}
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          status === "active"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-red-500/10 text-red-600"
                        }`}
                      >
                        {status === "active" ? "نشط" : "موقوف"}
                      </span>
                    </td>
                    <td className="p-3">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => featMut.mutate({ userId: u.id, featured: !featured })}
                        aria-label="featured"
                      >
                        {featured ? (
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        ) : (
                          <StarOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </td>
                    <td className="p-3">
                      {status === "active" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5"
                          onClick={() => statusMut.mutate({ userId: u.id, status: "suspended" })}
                        >
                          <UserX className="h-3.5 w-3.5" /> إيقاف
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5"
                          onClick={() => statusMut.mutate({ userId: u.id, status: "active" })}
                        >
                          <UserCheck className="h-3.5 w-3.5" /> تفعيل
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    لا يوجد مستخدمون
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
