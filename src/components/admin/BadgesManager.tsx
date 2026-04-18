import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Award as AwardIcon, Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createBadge,
  deleteBadge,
  fetchAdminUsers,
  fetchAllBadges,
  fetchMemberBadges,
  grantBadge,
  revokeBadge,
} from "@/lib/adminApi";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { BadgeIcon } from "@/components/BadgeIcon";

export const BadgesManager = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);
  const [grantOpen, setGrantOpen] = useState(false);
  const [form, setForm] = useState({ key: "", name_ar: "", name_en: "", description_ar: "", icon: "Award", color: "gold" });
  const [grant, setGrant] = useState({ profileId: "", badgeId: "", note: "" });

  const { data: badges = [], isLoading } = useQuery({ queryKey: ["badges"], queryFn: fetchAllBadges });
  const { data: users = [] } = useQuery({ queryKey: ["admin-users"], queryFn: fetchAdminUsers });
  const profUsers = users.filter((u) => u.roles.includes("professor") || u.roles.includes("super_admin"));

  const { data: memberBadges = [] } = useQuery({
    queryKey: ["member-badges", grant.profileId],
    queryFn: () => fetchMemberBadges(grant.profileId),
    enabled: !!grant.profileId,
  });

  const createMut = useMutation({
    mutationFn: () => createBadge(form),
    onSuccess: () => {
      toast.success("تم إنشاء الوسام");
      qc.invalidateQueries({ queryKey: ["badges"] });
      setCreateOpen(false);
      setForm({ key: "", name_ar: "", name_en: "", description_ar: "", icon: "Award", color: "gold" });
    },
    onError: (e: any) => toast.error(e.message ?? "فشل"),
  });

  const delMut = useMutation({
    mutationFn: deleteBadge,
    onSuccess: () => {
      toast.success("تم الحذف");
      qc.invalidateQueries({ queryKey: ["badges"] });
    },
  });

  const grantMut = useMutation({
    mutationFn: () => grantBadge(grant.profileId, grant.badgeId, user!.id, grant.note || undefined),
    onSuccess: () => {
      toast.success("تم منح الوسام");
      qc.invalidateQueries({ queryKey: ["member-badges", grant.profileId] });
      setGrant({ ...grant, badgeId: "", note: "" });
    },
    onError: (e: any) => toast.error(e.message ?? "فشل"),
  });

  const revokeMut = useMutation({
    mutationFn: revokeBadge,
    onSuccess: () => {
      toast.success("تم سحب الوسام");
      qc.invalidateQueries({ queryKey: ["member-badges", grant.profileId] });
    },
  });

  return (
    <div className="space-y-6">
      {/* Catalogue */}
      <section className="card-elegant p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold flex items-center gap-2"><AwardIcon className="h-5 w-5 text-accent" /> كتالوج الأوسمة</h3>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> إنشاء وسام</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>وسام جديد</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>المعرّف (key)</Label><Input value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} placeholder="top-publisher" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>الاسم بالعربية</Label><Input value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} /></div>
                  <div><Label>Name (EN)</Label><Input value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} /></div>
                </div>
                <div><Label>الوصف</Label><Input value={form.description_ar} onChange={(e) => setForm({ ...form, description_ar: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>الأيقونة (lucide)</Label><Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="Award" /></div>
                  <div><Label>اللون</Label><Input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} placeholder="gold" /></div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => createMut.mutate()} disabled={createMut.isPending || !form.key || !form.name_ar}>
                  {createMut.isPending && <Loader2 className="h-4 w-4 animate-spin me-2" />} حفظ
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="py-8 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-accent" /></div>
        ) : badges.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-6">لا توجد أوسمة بعد</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {badges.map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="flex items-center gap-3">
                  <BadgeIcon badgeKey={b.key} badgeNameAr={b.name_ar} badgeNameEn={b.name_en} iconName={b.icon} size="sm" />
                  <div>
                    <div className="font-semibold text-sm">{b.name_ar}</div>
                    <div className="text-xs text-muted-foreground">{b.key}</div>
                  </div>
                </div>
                <Button size="icon" variant="ghost" onClick={() => delMut.mutate(b.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Grant to member */}
      <section className="card-elegant p-5">
        <h3 className="font-bold flex items-center gap-2 mb-4"><UserPlus className="h-5 w-5 text-accent" /> منح وسام لعضو</h3>
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <Label>العضو</Label>
            <Select value={grant.profileId} onValueChange={(v) => setGrant({ ...grant, profileId: v })}>
              <SelectTrigger><SelectValue placeholder="اختر عضواً" /></SelectTrigger>
              <SelectContent>
                {profUsers.map((u) => (
                  <SelectItem key={u.id} value={u.id}>{u.profile?.name_ar ?? u.email}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>الوسام</Label>
            <Select value={grant.badgeId} onValueChange={(v) => setGrant({ ...grant, badgeId: v })}>
              <SelectTrigger><SelectValue placeholder="اختر وساماً" /></SelectTrigger>
              <SelectContent>
                {badges.map((b) => (
                  <SelectItem key={b.id} value={b.id}>{b.name_ar}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>ملاحظة (اختياري)</Label>
            <Input value={grant.note} onChange={(e) => setGrant({ ...grant, note: e.target.value })} />
          </div>
        </div>
        <Button
          className="mt-4 gap-1.5"
          onClick={() => grantMut.mutate()}
          disabled={!grant.profileId || !grant.badgeId || grantMut.isPending}
        >
          {grantMut.isPending && <Loader2 className="h-4 w-4 animate-spin" />} منح الوسام
        </Button>

        {grant.profileId && memberBadges.length > 0 && (
          <div className="mt-5">
            <h4 className="text-sm font-semibold mb-2">أوسمة العضو الحالية</h4>
            <div className="flex flex-wrap gap-2">
              {memberBadges.map((mb: any) => (
                <span key={mb.id} className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs">
                  <BadgeIcon badgeKey={mb.badge?.key ?? ""} badgeNameAr={mb.badge?.name_ar} badgeNameEn={mb.badge?.name_en} iconName={mb.badge?.icon ?? "Award"} size="sm" />
                  {mb.badge?.name_ar}
                  <button className="text-destructive" onClick={() => revokeMut.mutate(mb.id)} aria-label="revoke">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
